package com.aldergate.clinic.controller;

import com.aldergate.clinic.dto.medical.RecordRequest;
import com.aldergate.clinic.dto.medical.RecordResponse;
import com.aldergate.clinic.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    @GetMapping("/patient/{patientId}")
    public List<RecordResponse> getPatientRecords(@PathVariable String patientId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        
        return medicalRecordService.getPatientRecords(patientId, userId, role);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecordResponse addRecord(@Valid @RequestBody RecordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        return medicalRecordService.addRecord(userId, request);
    }
}
