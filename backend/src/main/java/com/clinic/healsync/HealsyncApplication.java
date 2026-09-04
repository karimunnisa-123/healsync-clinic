package com.clinic.healsync;

import com.clinic.healsync.entity.Appointment;
import com.clinic.healsync.entity.AppointmentStatus;
import com.clinic.healsync.entity.Doctor;
import com.clinic.healsync.entity.Patient;
import com.clinic.healsync.repository.AppointmentRepository;
import com.clinic.healsync.repository.DoctorRepository;
import com.clinic.healsync.repository.PatientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class HealsyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealsyncApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(DoctorRepository doctorRepository,
                                      PatientRepository patientRepository,
                                      AppointmentRepository appointmentRepository) {
        return args -> {
            // ======== ADD SAMPLE DOCTORS ========
            if (doctorRepository.count() == 0) {
                Doctor doctor1 = new Doctor(null, "Dr. Sarah Wilson", "Cardiologist", 
                        "sarah@clinic.com", "555-0101", null);
                Doctor doctor2 = new Doctor(null, "Dr. James Patel", "Dermatologist", 
                        "james@clinic.com", "555-0102", null);
                Doctor doctor3 = new Doctor(null, "Dr. Emily Chen", "Pediatrician", 
                        "emily@clinic.com", "555-0105", null);
                
                doctorRepository.save(doctor1);
                doctorRepository.save(doctor2);
                doctorRepository.save(doctor3);
                
                System.out.println("✅ 3 Sample doctors added!");
            }

            // ======== ADD SAMPLE PATIENTS ========
            if (patientRepository.count() == 0) {
                Patient patient1 = new Patient(null, "John Doe", "john@example.com", 
                        "555-0103", LocalDate.of(1985, 6, 15), "MALE", 
                        "123 Main St, New York", null);
                Patient patient2 = new Patient(null, "Jane Smith", "jane@example.com", 
                        "555-0104", LocalDate.of(1990, 3, 22), "FEMALE", 
                        "456 Oak Ave, Los Angeles", null);
                Patient patient3 = new Patient(null, "Robert Johnson", "robert@example.com", 
                        "555-0106", LocalDate.of(1978, 11, 5), "MALE", 
                        "789 Pine Rd, Chicago", null);
                Patient patient4 = new Patient(null, "Maria Garcia", "maria@example.com", 
                        "555-0107", LocalDate.of(1995, 8, 12), "FEMALE", 
                        "321 Elm St, Miami", null);
                
                patientRepository.save(patient1);
                patientRepository.save(patient2);
                patientRepository.save(patient3);
                patientRepository.save(patient4);
                
                System.out.println("✅ 4 Sample patients added!");
            }

            // ======== ADD SAMPLE APPOINTMENTS ========
            if (appointmentRepository.count() == 0 && doctorRepository.count() > 0 && patientRepository.count() > 0) {
                Doctor doctor1 = doctorRepository.findAll().get(0);
                Doctor doctor2 = doctorRepository.findAll().get(1);
                Patient patient1 = patientRepository.findAll().get(0);
                Patient patient2 = patientRepository.findAll().get(1);
                Patient patient3 = patientRepository.findAll().get(2);
                
                // Today + 1 day at 10:00 AM
                Appointment appt1 = new Appointment(null, patient1, doctor1, 
                        LocalDateTime.now().plusDays(1).withHour(10).withMinute(0),
                        "Regular checkup", AppointmentStatus.SCHEDULED, 
                        "Patient has high blood pressure", 0);
                
                // Today + 2 days at 2:30 PM
                Appointment appt2 = new Appointment(null, patient2, doctor2, 
                        LocalDateTime.now().plusDays(2).withHour(14).withMinute(30),
                        "Skin rash consultation", AppointmentStatus.SCHEDULED, 
                        "Patient has allergic reaction", 0);
                
                // Today + 3 days at 11:15 AM
                Appointment appt3 = new Appointment(null, patient3, doctor1, 
                        LocalDateTime.now().plusDays(3).withHour(11).withMinute(15),
                        "Post-surgery follow-up", AppointmentStatus.SCHEDULED, 
                        "Check healing progress", 0);
                
                // Past appointment (already completed)
                Appointment appt4 = new Appointment(null, patient1, doctor2, 
                        LocalDateTime.now().minusDays(5).withHour(9).withMinute(0),
                        "Annual skin check", AppointmentStatus.COMPLETED, 
                        "No issues found", 0);
                
                appointmentRepository.save(appt1);
                appointmentRepository.save(appt2);
                appointmentRepository.save(appt3);
                appointmentRepository.save(appt4);
                
                System.out.println("✅ 4 Sample appointments added!");
            }
            
            System.out.println("🎉 All sample data loaded successfully!");
        };
    }
}