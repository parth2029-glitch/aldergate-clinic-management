package com.aldergate.clinic;

import com.aldergate.clinic.config.JwtUtil;
import com.aldergate.clinic.model.Availability;
import com.aldergate.clinic.model.Doctor;
import com.aldergate.clinic.model.Patient;
import com.aldergate.clinic.model.TimeRange;
import com.aldergate.clinic.model.User;
import com.aldergate.clinic.model.enums.Role;
import com.aldergate.clinic.repository.AppointmentRepository;
import com.aldergate.clinic.repository.DoctorRepository;
import com.aldergate.clinic.repository.MedicalRecordRepository;
import com.aldergate.clinic.repository.PatientRepository;
import com.aldergate.clinic.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Implementation plan step 1.4 — "the one test that matters here":
 * fire ~20 concurrent bookings at the same slot from a thread pool and assert
 * exactly one 201 and the rest 409.
 *
 * <p>This drives the real HTTP endpoint on a real servlet container so the race
 * is genuine, and it relies on the partial unique index on
 * {@code {doctorId, appointmentDate, appointmentTime}} where {@code active = true}
 * to arbitrate — not on any application-level check-then-insert.
 *
 * <p>Requires MongoDB reachable at {@code localhost:27017} (the standalone mongod
 * the plan assumes). The test uses a dedicated {@code aldergate_test} database and
 * clears it per run.
 */
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.data.mongodb.uri=mongodb://localhost:27017/aldergate_test",
                "jwt.secret=test-only-secret-key-min-32-chars-0123456789",
                "jwt.expiration=86400000"
        }
)
class BookingConcurrencyTest {

    private static final int ATTEMPTS = 20;
    private static final String SLOT = "09:00";

    @Autowired
    private TestRestTemplate rest;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    private String doctorId;
    private String patientToken;
    private LocalDate date;

    @BeforeEach
    void setUp() {
        appointmentRepository.deleteAll();
        medicalRecordRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();
        userRepository.deleteAll();

        date = LocalDate.now().plusDays(1);
        DayOfWeek day = date.getDayOfWeek();

        User doctorUser = new User();
        doctorUser.setEmail("race.doc@aldergate.test");
        doctorUser.setPassword(passwordEncoder.encode("Race@123"));
        doctorUser.setName("Race Doctor");
        doctorUser.setRole(Role.DOCTOR);
        doctorUser = userRepository.save(doctorUser);

        Availability availability = new Availability();
        availability.setSlotMinutes(30);
        Map<DayOfWeek, List<TimeRange>> weekly = new HashMap<>();
        weekly.put(day, List.of(new TimeRange("09:00", "10:00")));
        availability.setWeekly(weekly);

        Doctor doctor = new Doctor();
        doctor.setUserId(doctorUser.getId());
        doctor.setName("Race Doctor");
        doctor.setSpecialization("Cardiology");
        doctor.setRoom("1.01");
        doctor.setAvailability(availability);
        doctor = doctorRepository.save(doctor);
        doctorId = doctor.getId();

        User patientUser = new User();
        patientUser.setEmail("race.pat@aldergate.test");
        patientUser.setPassword(passwordEncoder.encode("Race@123"));
        patientUser.setName("Race Patient");
        patientUser.setRole(Role.PATIENT);
        patientUser = userRepository.save(patientUser);

        Patient patient = new Patient();
        patient.setUserId(patientUser.getId());
        patient.setName("Race Patient");
        patient.setEmail("race.pat@aldergate.test");
        patientRepository.save(patient);

        patientToken = jwtUtil.generateToken(patientUser.getId(), "PATIENT");
    }

    @Test
    void onlyOneOfTwentyConcurrentBookingsSucceeds() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(ATTEMPTS);
        CountDownLatch startGate = new CountDownLatch(1);

        List<Future<Integer>> futures = new ArrayList<>();
        for (int i = 0; i < ATTEMPTS; i++) {
            futures.add(pool.submit(() -> {
                startGate.await();
                return book(SLOT).getStatusCode().value();
            }));
        }

        // Release every thread at once so the requests genuinely overlap.
        startGate.countDown();
        pool.shutdown();
        pool.awaitTermination(60, TimeUnit.SECONDS);

        List<Integer> codes = new ArrayList<>();
        for (Future<Integer> future : futures) {
            codes.add(future.get());
        }

        long created = codes.stream().filter(code -> code == 201).count();
        long conflicts = codes.stream().filter(code -> code == 409).count();

        assertEquals(1, created, "exactly one booking must be created, got: " + codes);
        assertEquals(ATTEMPTS - 1, conflicts, "every other booking must be 409, got: " + codes);
        assertEquals(1, appointmentRepository.count(), "only one appointment row may exist");
    }

    private ResponseEntity<String> book(String time) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(patientToken);

        Map<String, Object> body = new HashMap<>();
        body.put("doctorId", doctorId);
        body.put("appointmentDate", date.toString());
        body.put("appointmentTime", time);
        body.put("reason", "Concurrency probe");

        return rest.postForEntity("/api/appointments", new HttpEntity<>(body, headers), String.class);
    }
}
