package com.aldergate.clinic.dto.doctor;

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
public class SlotResponse {
    private LocalDate date;
    private List<String> availableSlots;
    private List<String> bookedSlots;
}
