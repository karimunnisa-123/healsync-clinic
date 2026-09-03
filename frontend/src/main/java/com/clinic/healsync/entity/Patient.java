package com.clinic.healsync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    
    private LocalDate dateOfBirth;
    private String gender; // MALE, FEMALE, OTHER
    private String address;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String photoBase64;
}