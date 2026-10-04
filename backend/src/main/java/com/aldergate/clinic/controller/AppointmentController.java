package com.aldergate.clinic.controller;

import com.aldergate.clinic.dto.appointment.AppointmentResponse;
import com.aldergate.clinic.dto.appointment.BookRequest;
import com.aldergate.clinic.dto.appointment.StatusUpdateRequest;
import com.aldergate.clinic.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse bookAppointment(@Valid @RequestBody BookRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        return appointmentService.bookAppointment(userId, request);
    }

    @GetMapping("/my")
    public List<AppointmentResponse> getMyAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        if ("PATIENT".equalsIgnoreCase(role)) {
            return appointmentService.getPatientAppointments(userId);
        } else if ("DOCTOR".equalsIgnoreCase(role)) {
            return appointmentService.getDoctorAppointments(userId);
        }
        return List.of();
    }

    @GetMapping("/{id}")
    public AppointmentResponse getAppointmentById(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        return appointmentService.getAppointmentById(id, userId);
    }

    @PutMapping("/{id}/status")
    public AppointmentResponse updateStatus(@PathVariable String id, @Valid @RequestBody StatusUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        return appointmentService.updateStatus(id, userId, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        appointmentService.cancelAppointment(id, userId);
        return ResponseEntity.noContent().build();
    }
}
