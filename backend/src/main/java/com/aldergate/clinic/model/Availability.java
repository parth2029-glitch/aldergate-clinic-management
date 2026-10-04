package com.aldergate.clinic.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Availability {
    private int slotMinutes = 30;
    private Map<DayOfWeek, List<TimeRange>> weekly;
}
