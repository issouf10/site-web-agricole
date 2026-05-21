package com.agroconnect.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class RegistrationController {

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestParam Map<String, String> params) {
        String nom = params.get("nom");
        String email = params.get("email");
        String password = params.get("password");

        // 1. Validation basique (équivalent à vos erreurs PHP)
        if (nom == null || nom.isEmpty()) {
            return ResponseEntity.badRequest().body("Le nom est obligatoire.");
        }
        
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest().body("L'email est invalide.");
        }

        if (password == null || password.length() < 8) {
            return ResponseEntity.badRequest().body("Le mot de passe doit faire 8 caractères.");
        }

        // 2. Hachage du mot de passe (équivalent à password_hash)
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String hashedPassword = passwordEncoder.encode(password);

        // 3. Ici, vous appelleriez un service pour sauvegarder en base de données (Repository)
        System.out.println("Utilisateur " + nom + " enregistré avec l'email " + email);
        
        return ResponseEntity.ok("Inscription réussie pour " + nom);
    }
}