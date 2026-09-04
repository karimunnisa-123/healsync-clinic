package com.clinic.healsync.repository;

import com.clinic.healsync.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Marks this as a database component
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    // We don't need to write any code here!
    // JpaRepository gives us built-in methods like save(), findAll(), findById(), delete()
}