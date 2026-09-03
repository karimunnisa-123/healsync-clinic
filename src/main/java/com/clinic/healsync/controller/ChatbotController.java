package com.clinic.healsync.controller;

import com.clinic.healsync.entity.Doctor;
import com.clinic.healsync.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping("/consult")
    public Map<String, Object> consultDoctor(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        String userMessage = request.get("message");
        
        if (userMessage == null || userMessage.trim().isEmpty()) {
            response.put("type", "info");
            response.put("message", "🤖 Please describe your symptoms so I can help you find the right doctor.");
            return response;
        }

        String msg = userMessage.toLowerCase().trim();
        System.out.println("🤖 Chatbot query: " + msg);

        // Find the specialty using a helper method
        String specialty = findSpecialty(msg);

        if (specialty != null) {
            // Find doctors with that specialty
            List<Doctor> doctors = doctorRepository.findAll().stream()
                    .filter(d -> d.getSpecialization() != null && 
                                d.getSpecialization().equalsIgnoreCase(specialty))
                    .collect(Collectors.toList());

            if (!doctors.isEmpty()) {
                Doctor doctor = doctors.get(0);
                response.put("type", "success");
                response.put("message", String.format(
                        "🩺 Based on your symptoms, I recommend consulting a **%s**.\n\n" +
                        "👨‍⚕️ **Dr. %s** is available.\n" +
                        "📧 Email: %s\n" +
                        "📞 Phone: %s\n\n" +
                        "Would you like to book an appointment?",
                        specialty,
                        doctor.getName(),
                        doctor.getEmail(),
                        doctor.getPhone()
                ));
                response.put("doctorId", doctor.getId());
                response.put("doctorName", doctor.getName());
                return response;
            } else {
                response.put("type", "info");
                response.put("message", String.format(
                        "🩺 I recommend seeing a **%s**.\n\n" +
                        "⚠️ However, we don't have a %s in our system yet.\n" +
                        "Please check back later or visit your nearest clinic.",
                        specialty, specialty
                ));
                return response;
            }
        } else {
            response.put("type", "info");
            response.put("message", 
                    "🤖 I'm your medical assistant. Please describe your symptoms.\n\n" +
                    "📋 **Examples of what you can say:**\n" +
                    "• 'I have chest pain' → Cardiologist\n" +
                    "• 'I have a skin rash' → Dermatologist\n" +
                    "• 'My child has a fever' → Pediatrician\n" +
                    "• 'My knee is hurting' → Orthopedic\n" +
                    "• 'I have diabetes' → General Physician\n" +
                    "• 'My tooth hurts' → Dentist\n\n" +
                    "I'll suggest the right doctor for you! 🩺"
            );
            return response;
        }
    }

    // Helper method to find specialty based on symptoms
    private String findSpecialty(String msg) {
        // Heart-related
        if (msg.contains("chest") || msg.contains("heart") || 
            msg.contains("bp") || msg.contains("blood pressure") || 
            msg.contains("palpitations")) {
            return "Cardiologist";
        }
        // Skin-related
        else if (msg.contains("rash") || msg.contains("skin") || 
                 msg.contains("acne") || msg.contains("eczema") || 
                 msg.contains("psoriasis") || msg.contains("allergy")) {
            return "Dermatologist";
        }
        // Children
        else if (msg.contains("fever") || msg.contains("cough") || 
                 msg.contains("cold") || msg.contains("child") || 
                 msg.contains("baby") || msg.contains("kids")) {
            return "Pediatrician";
        }
        // Bone/Joint
        else if (msg.contains("bone") || msg.contains("fracture") || 
                 msg.contains("joint") || msg.contains("knee") || 
                 msg.contains("back pain") || msg.contains("spine") || 
                 msg.contains("neck pain")) {
            return "Orthopedic";
        }
        // Eye
        else if (msg.contains("eye") || msg.contains("vision") || 
                 msg.contains("blur") || msg.contains("blindness")) {
            return "Ophthalmologist";
        }
        // Head/Brain
        else if (msg.contains("headache") || msg.contains("migraine") || 
                 msg.contains("dizziness") || msg.contains("brain") || 
                 msg.contains("seizure")) {
            return "Neurologist";
        }
        // General
        else if (msg.contains("diabetes") || msg.contains("thyroid") || 
                 msg.contains("stomach") || msg.contains("acidity") ||
                 msg.contains("flu") || msg.contains("infection") || 
                 msg.contains("vomiting") || msg.contains("nausea")) {
            return "General Physician";
        }
        // Dental
        else if (msg.contains("tooth") || msg.contains("gum") || 
                 msg.contains("dental") || msg.contains("teeth")) {
            return "Dentist";
        }
        return null;
    }
}