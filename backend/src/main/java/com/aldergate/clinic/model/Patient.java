package com.aldergate.clinic.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "patients")
public class Patient {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String name;
    private int age;
    private String gender;
    private String email;
    private String phone;
    private String bloodGroup;
    private String address;
    private LocalDate registeredAt;
}
