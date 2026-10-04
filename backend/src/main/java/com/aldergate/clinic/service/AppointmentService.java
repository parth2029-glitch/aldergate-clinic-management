package com.aldergate.clinic.service;

import com.aldergate.clinic.dto.appointment.AppointmentResponse;
import com.aldergate.clinic.dto.appointment.BookRequest;
import com.aldergate.clinic.dto.appointment.StatusUpdateRequest;
import com.aldergate.clinic.dto.doctor.SlotResponse;
import com.aldergate.clinic.exception.BadRequestException;
import com.aldergate.clinic.exception.ResourceNotFoundException;
import com.aldergate.clinic.exception.SlotConflictException;
import com.aldergate.clinic.exception.UnauthorizedException;
import com.aldergate.clinic.model.Appointment;
import com.aldergate.clinic.model.Doctor;
import com.aldergate.clinic.model.Patient;
import com.aldergate.clinic.model.enums.AppointmentStatus;
import com.aldergate.clinic.repository.AppointmentRepository;
import com.aldergate.clinic.repository.DoctorRepository;
import com.aldergate.clinic.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorService doctorService;

    public AppointmentResponse bookAppointment(String patientUserId, BookRequest req) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (req.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book an appointment in the past");
        }

        SlotResponse slots = doctorService.getAvailableSlots(doctor.getId(), req.getAppointmentDate());
        // A slot that is in the template but already taken is a 409; a slot that was
        // never offered is a 400. The two cases need different client handling.
        if (slots.getBookedSlots().contains(req.getAppointmentTime())) {
            throw new SlotConflictException("Slot already booked");
        }
        if (!slots.getAvailableSlots().contains(req.getAppointmentTime())) {
            throw new BadRequestException("Slot is outside the doctor's availability");
        }

        Appointment appt = Appointment.builder()
                .doctorId(doctor.getId())
                .patientId(patient.getId())
                .doctorName(doctor.getName())
                .patientName(patient.getName())
                .specialization(doctor.getSpecialization())
                .appointmentDate(req.getAppointmentDate())
                .appointmentTime(req.getAppointmentTime())
                .status(AppointmentStatus.PENDING)
                .reason(req.getReason())
                .room(doctor.getRoom())
                .active(true)
                .createdAt(LocalDate.now())
                .build();

        try {
            appt = appointmentRepository.save(appt);
        } catch (DuplicateKeyException e) {
            throw new SlotConflictException("Slot already booked");
        }

        return mapToResponse(appt);
    }

    public List<AppointmentResponse> getPatientAppointments(String patientUserId) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patient.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorAppointments(String doctorUserId) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctor.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(String id, String userId) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        boolean owns = false;
        if (doctorRepository.findByUserId(userId).map(Doctor::getId).filter(dId -> dId.equals(appt.getDoctorId())).isPresent()) {
            owns = true;
        } else if (patientRepository.findByUserId(userId).map(Patient::getId).filter(pId -> pId.equals(appt.getPatientId())).isPresent()) {
            owns = true;
        }

        if (!owns) {
            throw new UnauthorizedException("Not authorized to access this appointment");
        }

        return mapToResponse(appt);
    }

    public AppointmentResponse updateStatus(String id, String doctorUserId, StatusUpdateRequest req) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        
        if (!appt.getDoctorId().equals(doctor.getId())) {
            throw new UnauthorizedException("Not authorized to update this appointment");
        }

        AppointmentStatus target;
        try {
            target = AppointmentStatus.valueOf(req.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Unknown status: " + req.getStatus());
        }

        if (!isValidTransition(appt.getStatus(), target)) {
            throw new BadRequestException(
                    "Invalid status transition: " + appt.getStatus() + " -> " + target);
        }

        appt.setStatus(target);
        // Cancelling must also clear `active`, otherwise the partial unique index
        // keeps holding the slot and nobody can rebook it.
        if (target == AppointmentStatus.CANCELLED) {
            appt.setActive(false);
        }

        return mapToResponse(appointmentRepository.save(appt));
    }

    private static final Map<AppointmentStatus, Set<AppointmentStatus>> ALLOWED_TRANSITIONS = Map.of(
            AppointmentStatus.PENDING, EnumSet.of(AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED),
            AppointmentStatus.CONFIRMED, EnumSet.of(AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED),
            AppointmentStatus.COMPLETED, EnumSet.noneOf(AppointmentStatus.class),
            AppointmentStatus.CANCELLED, EnumSet.noneOf(AppointmentStatus.class));

    private boolean isValidTransition(AppointmentStatus from, AppointmentStatus to) {
        return ALLOWED_TRANSITIONS.getOrDefault(from, EnumSet.noneOf(AppointmentStatus.class)).contains(to);
    }

    public void cancelAppointment(String id, String patientUserId) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!appt.getPatientId().equals(patient.getId())) {
            throw new UnauthorizedException("Not authorized to cancel this appointment");
        }

        appt.setStatus(AppointmentStatus.CANCELLED);
        appt.setActive(false);
        appointmentRepository.save(appt);
    }

    private AppointmentResponse mapToResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .doctorId(a.getDoctorId())
                .patientId(a.getPatientId())
                .doctorName(a.getDoctorName())
                .patientName(a.getPatientName())
                .specialization(a.getSpecialization())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus().name())
                .reason(a.getReason())
                .room(a.getRoom())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
