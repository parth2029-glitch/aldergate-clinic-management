package com.aldergate.clinic.dto.medical;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordRequest {
    @NotBlank
    private String patientId;

    private String appointmentId;

    @NotBlank
    private String symptoms;

    @NotBlank
    private String diagnosis;

    private List<String> prescription;
    private String notes;
    private String followUp;
}
