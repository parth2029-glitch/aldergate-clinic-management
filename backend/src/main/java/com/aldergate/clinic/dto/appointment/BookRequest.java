package com.aldergate.clinic.dto.appointment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookRequest {
    @NotBlank
    private String doctorId;

    @NotNull
    private LocalDate appointmentDate;

    @NotBlank
    private String appointmentTime;

    private String reason;
}
