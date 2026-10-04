package com.aldergate.clinic.controller;

import com.aldergate.clinic.dto.admin.CreateDoctorRequest;
import com.aldergate.clinic.dto.auth.AuthResponse;
import com.aldergate.clinic.dto.doctor.DoctorResponse;
import com.aldergate.clinic.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/doctors")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        return adminService.createDoctor(request);
    }

    @GetMapping("/doctors")
    public List<DoctorResponse> getAllDoctorsAdmin() {
        return adminService.getAllDoctorsAdmin();
    }
}
