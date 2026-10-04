package com.aldergate.clinic.dto.patient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientUpdateRequest {
    private String name;
    private Integer age;
    private String gender;
    private String phone;
    private String bloodGroup;
    private String address;
}
