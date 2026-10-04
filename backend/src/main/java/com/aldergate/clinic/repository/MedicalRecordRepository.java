package com.aldergate.clinic.repository;

import com.aldergate.clinic.model.MedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {
    List<MedicalRecord> findByPatientIdOrderByDateDesc(String patientId);
}
