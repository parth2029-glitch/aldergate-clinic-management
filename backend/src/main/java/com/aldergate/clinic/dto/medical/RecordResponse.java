package com.aldergate.clinic.dto.medical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordResponse {
    private String id;
    private String patientId;
    private String doctorId;
    private String doctorName;
    private String specialization;
    private LocalDate date;
    private String symptoms;
    private String diagnosis;
    private List<String> prescription;
    private String notes;
    private String followUp;
}
