package com.aldergate.clinic.dto.doctor;

import com.aldergate.clinic.model.Availability;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponse {
    private String id;
    private String userId;
    private String name;
    private String specialization;
    private String qualification;
    private int experience;
    private double fee;
    private String room;
    private String about;
    private List<String> languages;
    private Availability availability;
}
