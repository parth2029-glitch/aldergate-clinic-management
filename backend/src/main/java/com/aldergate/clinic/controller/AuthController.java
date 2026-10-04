package com.aldergate.clinic.controller;

import com.aldergate.clinic.dto.auth.AuthResponse;
import com.aldergate.clinic.dto.auth.LoginRequest;
import com.aldergate.clinic.dto.auth.RegisterRequest;
import com.aldergate.clinic.dto.auth.UserInfo;
import com.aldergate.clinic.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public UserInfo getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        return authService.getCurrentUser(userId);
    }
}
