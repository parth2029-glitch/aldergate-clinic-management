package com.aldergate.clinic.controller;

import com.aldergate.clinic.dto.patient.PatientResponse;
import com.aldergate.clinic.dto.patient.PatientUpdateRequest;
import com.aldergate.clinic.exception.ResourceNotFoundException;
import com.aldergate.clinic.exception.UnauthorizedException;
import com.aldergate.clinic.model.Doctor;
import com.aldergate.clinic.repository.AppointmentRepository;
import com.aldergate.clinic.repository.DoctorRepository;
import com.aldergate.clinic.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @GetMapping("/my")
    public PatientResponse getMyPatientProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        return patientService.getPatientByUserId(userId);
    }

    @PutMapping("/me")
    public PatientResponse updateMyPatientProfile(@RequestBody PatientUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        return patientService.updatePatient(userId, request);
    }

    @GetMapping("/{id}")
    public PatientResponse getPatientById(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        if (!"DOCTOR".equalsIgnoreCase(role)) {
            throw new UnauthorizedException("Only doctors can access patient details by ID");
        }

        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!appointmentRepository.existsByDoctorIdAndPatientId(doctor.getId(), id)) {
            throw new UnauthorizedException("Not authorized to view this patient's details");
        }

        return patientService.getPatientById(id);
    }
}
