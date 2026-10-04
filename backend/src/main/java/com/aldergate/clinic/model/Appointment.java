package com.aldergate.clinic.model;

import com.aldergate.clinic.model.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "appointments")
@CompoundIndex(
        name = "unique_active_slot",
        def = "{'doctorId':1, 'appointmentDate':1, 'appointmentTime':1}",
        unique = true,
        partialFilter = "{'active': true}"
)
public class Appointment {
    @Id
    private String id;

    private String doctorId;
    private String patientId;
    private String doctorName;
    private String patientName;
    private String specialization;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private AppointmentStatus status;
    private String reason;
    private String room;
    private boolean active;
    private LocalDate createdAt;
}
