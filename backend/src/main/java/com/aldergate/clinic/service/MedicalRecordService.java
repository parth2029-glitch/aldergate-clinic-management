package com.aldergate.clinic.service;

import com.aldergate.clinic.dto.medical.RecordRequest;
import com.aldergate.clinic.dto.medical.RecordResponse;
import com.aldergate.clinic.exception.ResourceNotFoundException;
import com.aldergate.clinic.exception.UnauthorizedException;
import com.aldergate.clinic.model.Doctor;
import com.aldergate.clinic.model.MedicalRecord;
import com.aldergate.clinic.model.Patient;
import com.aldergate.clinic.repository.AppointmentRepository;
import com.aldergate.clinic.repository.DoctorRepository;
import com.aldergate.clinic.repository.MedicalRecordRepository;
import com.aldergate.clinic.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public List<RecordResponse> getPatientRecords(String patientId, String requesterId, String requesterRole) {
        if ("PATIENT".equalsIgnoreCase(requesterRole)) {
            Patient patient = patientRepository.findByUserId(requesterId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
            if (!patient.getId().equals(patientId)) {
                throw new UnauthorizedException("Not authorized to view these records");
            }
        } else if ("DOCTOR".equalsIgnoreCase(requesterRole)) {
            Doctor doctor = doctorRepository.findByUserId(requesterId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            if (!appointmentRepository.existsByDoctorIdAndPatientId(doctor.getId(), patientId)) {
                throw new UnauthorizedException("Not authorized to view these records");
            }
        } else if (!"ADMIN".equalsIgnoreCase(requesterRole)) {
            throw new UnauthorizedException("Unauthorized role");
        }

        return medicalRecordRepository.findByPatientIdOrderByDateDesc(patientId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RecordResponse addRecord(String doctorUserId, RecordRequest req) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!appointmentRepository.existsByDoctorIdAndPatientId(doctor.getId(), req.getPatientId())) {
            throw new UnauthorizedException("Not authorized to add records for this patient");
        }

        MedicalRecord record = MedicalRecord.builder()
                .patientId(req.getPatientId())
                .doctorId(doctor.getId())
                .doctorName(doctor.getName())
                .specialization(doctor.getSpecialization())
                .date(LocalDate.now())
                .symptoms(req.getSymptoms())
                .diagnosis(req.getDiagnosis())
                .prescription(req.getPrescription())
                .notes(req.getNotes())
                .followUp(req.getFollowUp())
                .build();

        return mapToResponse(medicalRecordRepository.save(record));
    }

    private RecordResponse mapToResponse(MedicalRecord r) {
        return RecordResponse.builder()
                .id(r.getId())
                .patientId(r.getPatientId())
                .doctorId(r.getDoctorId())
                .doctorName(r.getDoctorName())
                .specialization(r.getSpecialization())
                .date(r.getDate())
                .symptoms(r.getSymptoms())
                .diagnosis(r.getDiagnosis())
                .prescription(r.getPrescription())
                .notes(r.getNotes())
                .followUp(r.getFollowUp())
                .build();
    }
}
