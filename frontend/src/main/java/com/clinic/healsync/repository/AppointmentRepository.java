package com.clinic.healsync.repository;

import com.clinic.healsync.entity.Appointment;
import com.clinic.healsync.entity.AppointmentStatus;
import com.clinic.healsync.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Check if a doctor is already booked at that time
    boolean existsByDoctorAndAppointmentDateTime(Doctor doctor, LocalDateTime dateTime);
    
    List<Appointment> findByDoctorAndAppointmentDateTimeBetween(Doctor doctor, LocalDateTime start, LocalDateTime end);
    
    List<Appointment> findByPatientId(Long patientId);
    
    List<Appointment> findByStatus(AppointmentStatus status);
}