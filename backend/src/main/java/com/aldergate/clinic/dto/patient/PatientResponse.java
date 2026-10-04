package com.aldergate.clinic.dto.patient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {
    private String id;
    private String userId;
    private String name;
    private int age;
    private String gender;
    private String email;
    private String phone;
    private String bloodGroup;
    private String address;
    private LocalDate registeredAt;
}
