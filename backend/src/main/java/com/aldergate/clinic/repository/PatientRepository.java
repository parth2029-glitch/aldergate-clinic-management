package com.aldergate.clinic.repository;

import com.aldergate.clinic.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface PatientRepository extends MongoRepository<Patient, String> {
    Optional<Patient> findByUserId(String userId);
}
