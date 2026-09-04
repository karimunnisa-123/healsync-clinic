package com.clinic.healsync.controller;

import com.clinic.healsync.entity.Appointment;
import com.clinic.healsync.entity.AppointmentStatus;
import com.clinic.healsync.entity.Doctor;
import com.clinic.healsync.entity.Patient;
import com.clinic.healsync.repository.AppointmentRepository;
import com.clinic.healsync.repository.DoctorRepository;
import com.clinic.healsync.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    // GET all appointments
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentRepository.findAll();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST - Book new appointment
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            System.out.println("📥 Received appointment request:");
            System.out.println("  Patient ID: " + (appointment.getPatient() != null ? appointment.getPatient().getId() : "null"));
            System.out.println("  Doctor ID: " + (appointment.getDoctor() != null ? appointment.getDoctor().getId() : "null"));
            System.out.println("  Date/Time: " + appointment.getAppointmentDateTime());

            // Validate doctor exists
            if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Doctor ID is required");
                return ResponseEntity.badRequest().body(error);
            }

            Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + appointment.getDoctor().getId()));

            // Validate patient exists
            if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Patient ID is required");
                return ResponseEntity.badRequest().body(error);
            }

            Patient patient = patientRepository.findById(appointment.getPatient().getId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + appointment.getPatient().getId()));

            appointment.setDoctor(doctor);
            appointment.setPatient(patient);

            // Check if slot is already booked
            if (appointmentRepository.existsByDoctorAndAppointmentDateTime(doctor, appointment.getAppointmentDateTime())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Doctor is already booked at this time!");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            // Set default status if not provided
            if (appointment.getStatus() == null) {
                appointment.setStatus(AppointmentStatus.SCHEDULED);
            }

            Appointment saved = appointmentRepository.save(appointment);
            System.out.println("✅ Appointment saved with ID: " + saved.getId());
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // PUT - Update appointment
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody Appointment updatedAppointment) {
        try {
            Appointment existing = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

            existing.setAppointmentDateTime(updatedAppointment.getAppointmentDateTime());
            existing.setReason(updatedAppointment.getReason());
            existing.setNotes(updatedAppointment.getNotes());
            existing.setStatus(updatedAppointment.getStatus());

            // Check for conflicts if date/time changed
            if (!existing.getAppointmentDateTime().equals(updatedAppointment.getAppointmentDateTime())) {
                Doctor doctor = existing.getDoctor();
                if (appointmentRepository.existsByDoctorAndAppointmentDateTime(doctor, updatedAppointment.getAppointmentDateTime())) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Doctor is already booked at this time!");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                }
            }

            Appointment saved = appointmentRepository.save(existing);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // DELETE - Cancel appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        try {
            if (!appointmentRepository.existsById(id)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Appointment not found with id: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            appointmentRepository.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Appointment cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // GET appointments by doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        try {
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            
            List<Appointment> appointments = appointmentRepository.findByDoctorAndAppointmentDateTimeBetween(
                    doctor,
                    LocalDateTime.now().minusDays(30),
                    LocalDateTime.now().plusDays(30)
            );
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // GET appointments by patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getAppointmentsByPatient(@PathVariable Long patientId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}