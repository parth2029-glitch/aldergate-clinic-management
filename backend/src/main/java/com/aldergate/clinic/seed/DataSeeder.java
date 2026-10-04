package com.aldergate.clinic.seed;

import com.aldergate.clinic.model.*;
import com.aldergate.clinic.model.enums.AppointmentStatus;
import com.aldergate.clinic.model.enums.Role;
import com.aldergate.clinic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        // 1. Admin
        User admin = new User();
        admin.setEmail("admin@aldergate.clinic");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setName("Clinic Office");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        // 2. Doctors
        List<DoctorSeed> docSeeds = Arrays.asList(
            new DoctorSeed("Ananya Raghunathan", "Cardiology", 14, "MD, DM Cardiology", "2.14", 900.0, "Sees adults for arrhythmia, hypertension and post-infarct follow-up. Runs the Tuesday and Thursday echo list.", Arrays.asList("English", "Kannada", "Tamil"), Arrays.asList("MONDAY", "TUESDAY", "THURSDAY", "FRIDAY"), Arrays.asList("09:00", "09:30", "10:00", "11:30", "12:00", "16:00", "16:30")),
            new DoctorSeed("Marcus Oyelaran", "Orthopaedics", 11, "MS Orthopaedics", "1.07", 850.0, "Knee and shoulder work, sports injury rehab, and fracture follow-up. Operating list runs Wednesdays.", Arrays.asList("English", "Yoruba"), Arrays.asList("MONDAY", "TUESDAY", "THURSDAY", "SATURDAY"), Arrays.asList("08:30", "09:00", "10:30", "11:00", "15:00", "15:30", "17:00")),
            new DoctorSeed("Priyamvada Sethi", "Dermatology", 8, "MD Dermatology", "3.02", 700.0, "Chronic eczema, acne and pigmentation. Patch testing by prior appointment only.", Arrays.asList("English", "Hindi", "Punjabi"), Arrays.asList("TUESDAY", "WEDNESDAY", "FRIDAY"), Arrays.asList("10:00", "10:30", "11:00", "14:30", "15:00", "15:30")),
            new DoctorSeed("Tobias Lindqvist", "Neurology", 19, "MD, PhD Neurology", "3.21", 1200.0, "Headache disorders, epilepsy and movement disorders. Longer first consultations by design.", Arrays.asList("English", "Swedish"), Arrays.asList("MONDAY", "WEDNESDAY", "FRIDAY"), Arrays.asList("09:30", "10:30", "11:30", "14:00", "15:00")),
            new DoctorSeed("Rehana Qureshi", "Paediatrics", 12, "MD Paediatrics", "0.11", 650.0, "Newborn to sixteen. Growth monitoring, immunisation schedules and childhood asthma.", Arrays.asList("English", "Hindi", "Urdu"), Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"), Arrays.asList("08:30", "09:00", "09:30", "10:00", "16:30", "17:00", "17:30")),
            new DoctorSeed("Ezekiel Boateng", "General Medicine", 6, "MBBS, MD General Medicine", "1.22", 500.0, "First point of contact for undifferentiated illness, and onward referral within the clinic.", Arrays.asList("English", "Twi"), Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"), Arrays.asList("08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30")),
            new DoctorSeed("Ingrid Solberg", "Endocrinology", 16, "MD, DM Endocrinology", "2.30", 950.0, "Type 1 and type 2 diabetes, thyroid disease and metabolic bone conditions.", Arrays.asList("English", "Norwegian"), Arrays.asList("TUESDAY", "THURSDAY"), Arrays.asList("11:00", "11:30", "12:00", "15:30", "16:00")),
            new DoctorSeed("Vikram Balasubramanian", "Pulmonology", 9, "MD Pulmonary Medicine", "2.05", 800.0, "Asthma, COPD and sleep-disordered breathing. Spirometry on site.", Arrays.asList("English", "Tamil", "Telugu"), Arrays.asList("WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"), Arrays.asList("09:00", "09:30", "13:30", "14:00", "14:30", "16:00"))
        );

        Map<String, Doctor> savedDocs = new HashMap<>();

        for (DoctorSeed ds : docSeeds) {
            String[] names = ds.name.split(" ");
            String email = names[0].toLowerCase() + "." + names[1].toLowerCase() + "@aldergate.clinic";

            User du = new User();
            du.setEmail(email);
            du.setPassword(passwordEncoder.encode("Doctor@123"));
            du.setName(ds.name);
            du.setRole(Role.DOCTOR);
            du = userRepository.save(du);

            Availability avail = new Availability();
            avail.setSlotMinutes(30);
            Map<DayOfWeek, List<TimeRange>> weekly = new HashMap<>();
            
            for (String d : ds.days) {
                DayOfWeek day = DayOfWeek.valueOf(d);
                List<TimeRange> ranges = new ArrayList<>();
                // Grouping contiguous 30 min slots - simplified for seeding
                // In a real scenario we'd collapse them. For seeding, we'll just add each as 30min range
                for(String st: ds.slots) {
                    java.time.LocalTime t = java.time.LocalTime.parse(st);
                    String end = t.plusMinutes(30).toString();
                    ranges.add(new TimeRange(st, end));
                }
                weekly.put(day, ranges);
            }
            avail.setWeekly(weekly);

            Doctor doc = new Doctor();
            doc.setUserId(du.getId());
            doc.setName(ds.name);
            doc.setSpecialization(ds.specialization);
            doc.setQualification(ds.qualification);
            doc.setExperience(ds.experience);
            doc.setFee(ds.fee);
            doc.setRoom(ds.room);
            doc.setAbout(ds.about);
            doc.setLanguages(ds.languages);
            doc.setAvailability(avail);
            doc = doctorRepository.save(doc);

            savedDocs.put(ds.name, doc);
        }

        // 3. Patient
        User pu = new User();
        pu.setEmail("n.fernandes@example.com");
        pu.setPassword(passwordEncoder.encode("Patient@123"));
        pu.setName("Nadia Fernandes");
        pu.setRole(Role.PATIENT);
        pu = userRepository.save(pu);

        Patient pat = new Patient();
        pat.setUserId(pu.getId());
        pat.setName("Nadia Fernandes");
        pat.setAge(34);
        pat.setGender("Female");
        pat.setEmail("n.fernandes@example.com");
        pat.setPhone("+91 98204 71336");
        pat.setBloodGroup("O+");
        pat.setAddress("12 Rosewood Lane, Bengaluru 560025");
        pat.setRegisteredAt(LocalDate.parse("2024-03-19"));
        pat = patientRepository.save(pat);

        // Another patient for records
        User pu2 = new User();
        pu2.setEmail("rasheed@example.com");
        pu2.setPassword(passwordEncoder.encode("Patient@123"));
        pu2.setName("Rasheed Al-Amin");
        pu2.setRole(Role.PATIENT);
        pu2 = userRepository.save(pu2);

        Patient pat2 = new Patient();
        pat2.setUserId(pu2.getId());
        pat2.setName("Rasheed Al-Amin");
        pat2.setAge(61);
        pat2.setGender("Male");
        pat2.setEmail("rasheed@example.com");
        pat2.setPhone("+91 91234 56789");
        pat2.setBloodGroup("A-");
        pat2.setAddress("Test Address");
        pat2.setRegisteredAt(LocalDate.parse("2024-03-19"));
        pat2 = patientRepository.save(pat2);

        // 4. Appointments
        List<Appointment> apps = new ArrayList<>();
        apps.add(createAppt(savedDocs.get("Ananya Raghunathan"), pat, "2026-08-18", "09:30", AppointmentStatus.CONFIRMED, "Palpitations on exertion, three weeks", "2026-08-09"));
        apps.add(createAppt(savedDocs.get("Priyamvada Sethi"), pat, "2026-08-26", "11:00", AppointmentStatus.PENDING, "Recurring eczema on both hands", "2026-08-12"));
        apps.add(createAppt(savedDocs.get("Ezekiel Boateng"), pat, "2026-06-02", "10:30", AppointmentStatus.COMPLETED, "Persistent cough after viral illness", "2026-05-28"));
        apps.add(createAppt(savedDocs.get("Ananya Raghunathan"), pat, "2026-02-11", "16:00", AppointmentStatus.COMPLETED, "Annual review, family history of ischaemic heart disease", "2026-02-03"));
        apps.add(createAppt(savedDocs.get("Tobias Lindqvist"), pat, "2025-11-27", "14:00", AppointmentStatus.CANCELLED, "Headache assessment", "2025-11-14"));
        appointmentRepository.saveAll(apps);

        // 5. Medical Records
        MedicalRecord mr1 = MedicalRecord.builder()
            .patientId(pat.getId()).doctorId(savedDocs.get("Ananya Raghunathan").getId()).doctorName("Ananya Raghunathan").specialization("Cardiology")
            .date(LocalDate.parse("2026-02-11"))
            .symptoms("Annual review. Occasional palpitations at rest, no syncope. Father had a myocardial infarction at 58.")
            .diagnosis("Benign ectopy. No structural abnormality on echo.")
            .prescription(Arrays.asList("Bisoprolol 1.25 mg — once daily, mornings, 90 days"))
            .notes("ECG sinus rhythm, occasional ventricular ectopics. Echo unremarkable, ejection fraction 62 percent. Reassured. Advised to log episodes with time of day and caffeine intake.")
            .followUp("Review in twelve months, sooner if episodes become sustained or she feels faint.")
            .build();
        MedicalRecord mr2 = MedicalRecord.builder()
            .patientId(pat.getId()).doctorId(savedDocs.get("Ezekiel Boateng").getId()).doctorName("Ezekiel Boateng").specialization("General Medicine")
            .date(LocalDate.parse("2026-06-02"))
            .symptoms("Dry cough persisting five weeks after a febrile illness. No breathlessness, no weight loss.")
            .diagnosis("Post-viral cough.")
            .prescription(Arrays.asList("No antibiotic indicated", "Simple linctus as required"))
            .notes("Chest clear on auscultation. Oxygen saturation 98 percent on air. Explained expected timeline of six to eight weeks. Safety-netted for haemoptysis or fever.")
            .followUp("Return if the cough persists beyond eight weeks or any blood is coughed up.")
            .build();
        MedicalRecord mr3 = MedicalRecord.builder()
            .patientId(pat.getId()).doctorId(savedDocs.get("Ananya Raghunathan").getId()).doctorName("Ananya Raghunathan").specialization("Cardiology")
            .date(LocalDate.parse("2025-09-08"))
            .symptoms("Referred after an incidental murmur was heard at a pre-employment medical.")
            .diagnosis("Innocent flow murmur.")
            .prescription(Arrays.asList("None"))
            .notes("Soft mid-systolic murmur at the left sternal edge, no radiation. Echo showed structurally normal valves. No endocarditis prophylaxis required.")
            .followUp("No routine follow-up needed. Discharged back to general practice.")
            .build();
        MedicalRecord mr4 = MedicalRecord.builder()
            .patientId(pat2.getId()).doctorId(savedDocs.get("Ananya Raghunathan").getId()).doctorName("Ananya Raghunathan").specialization("Cardiology")
            .date(LocalDate.parse("2026-02-14"))
            .symptoms("Six-week review following angioplasty and stent to the right coronary artery.")
            .diagnosis("Stable ischaemic heart disease, post-PCI.")
            .prescription(Arrays.asList("Aspirin 75 mg — once daily, indefinitely", "Ticagrelor 90 mg — twice daily, 12 months", "Atorvastatin 80 mg — once nightly"))
            .notes("Walking thirty minutes daily without chest pain. Blood pressure 128 over 76. Cardiac rehabilitation attendance good.")
            .followUp("Repeat lipid panel before the next visit. Review in six months.")
            .build();
        medicalRecordRepository.saveAll(Arrays.asList(mr1, mr2, mr3, mr4));
    }

    private Appointment createAppt(Doctor doc, Patient pat, String date, String time, AppointmentStatus status, String reason, String createdAt) {
        return Appointment.builder()
            .doctorId(doc.getId())
            .patientId(pat.getId())
            .doctorName(doc.getName())
            .patientName(pat.getName())
            .specialization(doc.getSpecialization())
            .appointmentDate(LocalDate.parse(date))
            .appointmentTime(time)
            .status(status)
            .reason(reason)
            .room(doc.getRoom())
            .active(status != AppointmentStatus.CANCELLED)
            .createdAt(LocalDate.parse(createdAt))
            .build();
    }

    record DoctorSeed(String name, String specialization, int experience, String qualification, String room, double fee, String about, List<String> languages, List<String> days, List<String> slots) {}
}
