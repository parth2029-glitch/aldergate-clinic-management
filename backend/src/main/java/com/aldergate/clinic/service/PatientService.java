package com.aldergate.clinic.service;

import com.aldergate.clinic.dto.patient.PatientResponse;
import com.aldergate.clinic.dto.patient.PatientUpdateRequest;
import com.aldergate.clinic.exception.ResourceNotFoundException;
import com.aldergate.clinic.model.Patient;
import com.aldergate.clinic.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepository;

    public PatientResponse getPatientByUserId(String userId) {
        Patient p = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return mapToResponse(p);
    }

    public PatientResponse getPatientById(String id) {
        Patient p = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return mapToResponse(p);
    }

    public PatientResponse updatePatient(String userId, PatientUpdateRequest req) {
        Patient p = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (req.getName() != null) p.setName(req.getName());
        if (req.getAge() != null) p.setAge(req.getAge());
        if (req.getGender() != null) p.setGender(req.getGender());
        if (req.getPhone() != null) p.setPhone(req.getPhone());
        if (req.getBloodGroup() != null) p.setBloodGroup(req.getBloodGroup());
        if (req.getAddress() != null) p.setAddress(req.getAddress());

        return mapToResponse(patientRepository.save(p));
    }

    private PatientResponse mapToResponse(Patient p) {
        return PatientResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .name(p.getName())
                .age(p.getAge())
                .gender(p.getGender())
                .email(p.getEmail())
                .phone(p.getPhone())
                .bloodGroup(p.getBloodGroup())
                .address(p.getAddress())
                .registeredAt(p.getRegisteredAt())
                .build();
    }
}
