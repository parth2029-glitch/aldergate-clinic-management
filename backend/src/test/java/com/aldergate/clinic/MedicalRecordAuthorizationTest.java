package com.aldergate.clinic;

import com.aldergate.clinic.config.JwtUtil;
import com.aldergate.clinic.model.Appointment;
import com.aldergate.clinic.model.Doctor;
import com.aldergate.clinic.model.Patient;
import com.aldergate.clinic.model.User;
import com.aldergate.clinic.model.enums.AppointmentStatus;
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
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Implementation plan step 1.5 — "the second test that matters":
 * doctor B requests doctor A's patient's records → 403.
 *
 * <p>The rule under test: a doctor may read a patient's medical records only if
 * that doctor has at least one appointment with that patient. The positive case is
 * included so the test cannot pass merely because the endpoint always denies.
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
class MedicalRecordAuthorizationTest {

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

    private String patientId;
    private String doctorAToken;
    private String doctorBToken;

    @BeforeEach
    void setUp() {
        appointmentRepository.deleteAll();
        medicalRecordRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();
        userRepository.deleteAll();

        // Doctor A — will have an appointment with the patient, so is authorized.
        User doctorAUser = newUser("authz.a@aldergate.test", "Doctor A", Role.DOCTOR);
        Doctor doctorA = newDoctor(doctorAUser, "Doctor A");

        // Doctor B — no appointment with the patient, so must be refused.
        User doctorBUser = newUser("authz.b@aldergate.test", "Doctor B", Role.DOCTOR);
        newDoctor(doctorBUser, "Doctor B");

        // Shared patient.
        User patientUser = newUser("authz.p@aldergate.test", "Shared Patient", Role.PATIENT);
        Patient patient = new Patient();
        patient.setUserId(patientUser.getId());
        patient.setName("Shared Patient");
        patient.setEmail("authz.p@aldergate.test");
        patient = patientRepository.save(patient);
        patientId = patient.getId();

        // The single appointment that grants A (and only A) access.
        Appointment appointment = new Appointment();
        appointment.setDoctorId(doctorA.getId());
        appointment.setPatientId(patientId);
        appointment.setDoctorName("Doctor A");
        appointment.setPatientName("Shared Patient");
        appointment.setSpecialization("Cardiology");
        appointment.setAppointmentDate(LocalDate.now());
        appointment.setAppointmentTime("09:00");
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setRoom("1.02");
        appointment.setActive(true);
        appointment.setCreatedAt(LocalDate.now());
        appointmentRepository.save(appointment);

        doctorAToken = jwtUtil.generateToken(doctorAUser.getId(), "DOCTOR");
        doctorBToken = jwtUtil.generateToken(doctorBUser.getId(), "DOCTOR");
    }

    @Test
    void doctorWithoutAnAppointmentIsForbidden() {
        ResponseEntity<String> response = getRecords(patientId, doctorBToken);

        assertEquals(403, response.getStatusCode().value(),
                "a doctor with no appointment for this patient must get 403, body: " + response.getBody());
    }

    @Test
    void doctorWithAnAppointmentIsAllowed() {
        ResponseEntity<String> response = getRecords(patientId, doctorAToken);

        assertEquals(200, response.getStatusCode().value(),
                "the doctor who shares an appointment must be allowed, body: " + response.getBody());
    }

    private User newUser(String email, String name, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Authz@123"));
        user.setName(name);
        user.setRole(role);
        return userRepository.save(user);
    }

    private Doctor newDoctor(User user, String name) {
        Doctor doctor = new Doctor();
        doctor.setUserId(user.getId());
        doctor.setName(name);
        doctor.setSpecialization("Cardiology");
        doctor.setRoom("1.02");
        return doctorRepository.save(doctor);
    }

    private ResponseEntity<String> getRecords(String patientId, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return rest.exchange(
                "/api/medical-records/patient/" + patientId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);
    }
}
