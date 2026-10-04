package com.aldergate.clinic.service;

import com.aldergate.clinic.config.JwtUtil;
import com.aldergate.clinic.dto.auth.AuthResponse;
import com.aldergate.clinic.dto.auth.LoginRequest;
import com.aldergate.clinic.dto.auth.RegisterRequest;
import com.aldergate.clinic.dto.auth.UserInfo;
import com.aldergate.clinic.exception.ConflictException;
import com.aldergate.clinic.exception.InvalidCredentialsException;
import com.aldergate.clinic.exception.ResourceNotFoundException;
import com.aldergate.clinic.exception.UnauthorizedException;
import com.aldergate.clinic.model.Patient;
import com.aldergate.clinic.model.User;
import com.aldergate.clinic.model.enums.Role;
import com.aldergate.clinic.repository.DoctorRepository;
import com.aldergate.clinic.repository.PatientRepository;
import com.aldergate.clinic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName());
        user.setRole(Role.PATIENT);
        user = userRepository.save(user);

        Patient patient = new Patient();
        patient.setUserId(user.getId());
        patient.setName(req.getName());
        patient.setAge(req.getAge());
        patient.setGender(req.getGender());
        patient.setEmail(req.getEmail());
        patient.setPhone(req.getPhone());
        patient.setBloodGroup(req.getBloodGroup());
        patient.setAddress(req.getAddress());
        patient.setRegisteredAt(LocalDate.now());
        patient = patientRepository.save(patient);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        UserInfo userInfo = new UserInfo(user.getId(), user.getEmail(), user.getName(), user.getRole().name(), patient.getId());

        return new AuthResponse(token, userInfo);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        String profileId = null;
        if (user.getRole() == Role.PATIENT) {
            profileId = patientRepository.findByUserId(user.getId())
                    .map(Patient::getId).orElse(null);
        } else if (user.getRole() == Role.DOCTOR) {
            profileId = doctorRepository.findByUserId(user.getId())
                    .map(com.aldergate.clinic.model.Doctor::getId).orElse(null);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        UserInfo userInfo = new UserInfo(user.getId(), user.getEmail(), user.getName(), user.getRole().name(), profileId);

        return new AuthResponse(token, userInfo);
    }

    public UserInfo getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String profileId = null;
        if (user.getRole() == Role.PATIENT) {
            profileId = patientRepository.findByUserId(user.getId())
                    .map(Patient::getId).orElse(null);
        } else if (user.getRole() == Role.DOCTOR) {
            profileId = doctorRepository.findByUserId(user.getId())
                    .map(com.aldergate.clinic.model.Doctor::getId).orElse(null);
        }

        return new UserInfo(user.getId(), user.getEmail(), user.getName(), user.getRole().name(), profileId);
    }
}
