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
public class DoctorUpdateRequest {
    private String about;
    private Double fee;
    private String room;
    private List<String> languages;
    private Availability availability;
}
