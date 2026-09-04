package com.clinic.healsync.controller;

import com.clinic.healsync.entity.Patient;
import com.clinic.healsync.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        return patientRepository.save(patient);
    }

    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable Long id, @RequestBody Patient updatedPatient) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        existing.setName(updatedPatient.getName());
        existing.setEmail(updatedPatient.getEmail());
        existing.setPhone(updatedPatient.getPhone());
        existing.setDateOfBirth(updatedPatient.getDateOfBirth());
        existing.setGender(updatedPatient.getGender());
        existing.setAddress(updatedPatient.getAddress());
        existing.setPhotoBase64(updatedPatient.getPhotoBase64());
        
        return patientRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deletePatient(@PathVariable Long id) {
        patientRepository.deleteById(id);
    }
}