package com.aldergate.clinic.repository;

import com.aldergate.clinic.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(String patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDesc(String doctorId);
    List<Appointment> findByDoctorIdAndAppointmentDateAndActiveTrue(String doctorId, LocalDate date);
    boolean existsByDoctorIdAndPatientId(String doctorId, String patientId);
}
