package com.aldergate.clinic.service;

import com.aldergate.clinic.dto.doctor.DoctorResponse;
import com.aldergate.clinic.dto.doctor.DoctorUpdateRequest;
import com.aldergate.clinic.dto.doctor.SlotResponse;
import com.aldergate.clinic.exception.ResourceNotFoundException;
import com.aldergate.clinic.model.Appointment;
import com.aldergate.clinic.model.Doctor;
import com.aldergate.clinic.model.TimeRange;
import com.aldergate.clinic.repository.AppointmentRepository;
import com.aldergate.clinic.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public List<DoctorResponse> getAllDoctors(String specialization) {
        List<Doctor> doctors;
        if (specialization == null || specialization.isBlank()) {
            doctors = doctorRepository.findAll();
        } else {
            doctors = doctorRepository.findBySpecialization(specialization);
        }
        return doctors.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public DoctorResponse getDoctorById(String id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return mapToResponse(doctor);
    }

    public DoctorResponse getDoctorByUserId(String userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return mapToResponse(doctor);
    }

    public DoctorResponse updateDoctor(String userId, DoctorUpdateRequest req) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (req.getAbout() != null) doctor.setAbout(req.getAbout());
        if (req.getFee() != null) doctor.setFee(req.getFee());
        if (req.getRoom() != null) doctor.setRoom(req.getRoom());
        if (req.getLanguages() != null) doctor.setLanguages(req.getLanguages());
        if (req.getAvailability() != null) doctor.setAvailability(req.getAvailability());

        return mapToResponse(doctorRepository.save(doctor));
    }

    public SlotResponse getAvailableSlots(String doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        DayOfWeek dayOfWeek = date.getDayOfWeek();
        List<String> allSlots = new ArrayList<>();

        if (doctor.getAvailability() != null && doctor.getAvailability().getWeekly() != null) {
            List<TimeRange> ranges = doctor.getAvailability().getWeekly().get(dayOfWeek);
            if (ranges != null) {
                int slotMinutes = doctor.getAvailability().getSlotMinutes() > 0 ? doctor.getAvailability().getSlotMinutes() : 30;
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

                for (TimeRange range : ranges) {
                    LocalTime current = LocalTime.parse(range.getStart(), formatter);
                    LocalTime end = LocalTime.parse(range.getEnd(), formatter);

                    while (current.isBefore(end)) {
                        allSlots.add(current.format(formatter));
                        current = current.plusMinutes(slotMinutes);
                    }
                }
            }
        }

        List<Appointment> booked = appointmentRepository.findByDoctorIdAndAppointmentDateAndActiveTrue(doctorId, date);
        List<String> bookedSlots = booked.stream()
                .map(Appointment::getAppointmentTime)
                .collect(Collectors.toList());

        List<String> availableSlots = allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .collect(Collectors.toList());

        return new SlotResponse(date, availableSlots, bookedSlots);
    }

    private DoctorResponse mapToResponse(Doctor d) {
        return DoctorResponse.builder()
                .id(d.getId())
                .userId(d.getUserId())
                .name(d.getName())
                .specialization(d.getSpecialization())
                .qualification(d.getQualification())
                .experience(d.getExperience())
                .fee(d.getFee())
                .room(d.getRoom())
                .about(d.getAbout())
                .languages(d.getLanguages())
                .availability(d.getAvailability())
                .build();
    }
}
