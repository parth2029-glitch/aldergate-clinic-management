package com.aldergate.clinic.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "doctors")
public class Doctor {
    @Id
    private String id;

    @Indexed(unique = true)
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
