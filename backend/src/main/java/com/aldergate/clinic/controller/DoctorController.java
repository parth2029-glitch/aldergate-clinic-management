package com.aldergate.clinic.controller;

import com.aldergate.clinic.dto.doctor.DoctorResponse;
import com.aldergate.clinic.dto.doctor.DoctorUpdateRequest;
import com.aldergate.clinic.dto.doctor.SlotResponse;
import com.aldergate.clinic.dto.patient.PatientResponse;
import com.aldergate.clinic.model.Appointment;
import com.aldergate.clinic.repository.AppointmentRepository;
import com.aldergate.clinic.repository.DoctorRepository;
import com.aldergate.clinic.service.DoctorService;
import com.aldergate.clinic.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientService patientService;

    @GetMapping
    public List<DoctorResponse> getAllDoctors(@RequestParam(required = false) String specialization) {
        return doctorService.getAllDoctors(specialization);
    }

    @GetMapping("/{id}")
    public DoctorResponse getDoctorById(@PathVariable String id) {
        return doctorService.getDoctorById(id);
    }

    @GetMapping("/{id}/slots")
    public SlotResponse getDoctorSlots(@PathVariable String id, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return doctorService.getAvailableSlots(id, date);
    }

    @PutMapping("/me")
    public DoctorResponse updateDoctor(@RequestBody DoctorUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        return doctorService.updateDoctor(userId, request);
    }

    @GetMapping("/patients")
    public List<PatientResponse> getPatientsForDoctor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        
        com.aldergate.clinic.model.Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new com.aldergate.clinic.exception.ResourceNotFoundException("Doctor not found"));

        List<Appointment> appointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctor.getId());
        List<String> patientIds = appointments.stream()
                .map(Appointment::getPatientId)
                .distinct()
                .collect(Collectors.toList());

        return patientIds.stream()
                .map(patientService::getPatientById)
                .collect(Collectors.toList());
    }
}
