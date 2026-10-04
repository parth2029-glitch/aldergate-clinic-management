package com.aldergate.clinic.service;

import com.aldergate.clinic.config.JwtUtil;
import com.aldergate.clinic.dto.admin.CreateDoctorRequest;
import com.aldergate.clinic.dto.auth.AuthResponse;
import com.aldergate.clinic.dto.auth.UserInfo;
import com.aldergate.clinic.dto.doctor.DoctorResponse;
import com.aldergate.clinic.exception.ConflictException;
import com.aldergate.clinic.model.Doctor;
import com.aldergate.clinic.model.User;
import com.aldergate.clinic.model.enums.Role;
import com.aldergate.clinic.repository.DoctorRepository;
import com.aldergate.clinic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse createDoctor(CreateDoctorRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName());
        user.setRole(Role.DOCTOR);
        user = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUserId(user.getId());
        doctor.setName(req.getName());
        doctor.setSpecialization(req.getSpecialization());
        doctor.setQualification(req.getQualification());
        doctor.setExperience(req.getExperience());
        doctor.setFee(req.getFee());
        doctor.setRoom(req.getRoom());
        doctor.setAbout(req.getAbout());
        doctor.setLanguages(req.getLanguages());
        doctor = doctorRepository.save(doctor);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        UserInfo userInfo = new UserInfo(user.getId(), user.getEmail(), user.getName(), user.getRole().name(), doctor.getId());

        return new AuthResponse(token, userInfo);
    }

    public List<DoctorResponse> getAllDoctorsAdmin() {
        return doctorRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
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
