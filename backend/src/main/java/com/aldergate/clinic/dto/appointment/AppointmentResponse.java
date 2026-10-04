package com.aldergate.clinic.dto.appointment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private String id;
    private String doctorId;
    private String patientId;
    private String doctorName;
    private String patientName;
    private String specialization;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String status;
    private String reason;
    private String room;
    private LocalDate createdAt;
}
