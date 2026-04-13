package com.example.webbackend.controller;

import com.example.webbackend.config.JwtService;
import com.example.webbackend.entity.User;
import com.example.webbackend.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;


import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "authentification", description = "authentification d'un utilisateur")
public class AuthController {
    private final AuthenticationService authenticationService;
    private final JwtService jwtService;

    public AuthController(AuthenticationService authenticationService, JwtService jwtService) {
        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
    }
    @PostMapping("/login")
    @Operation(
            summary = "Authentifier un utilisateur",
            description = "Permet d'authentifier un utilisateur dans le système."
    )
    @ApiResponse(responseCode = "200", description = "authentification succès")
    @ApiResponse(responseCode = "400", description = "Requête invalide")
    @ApiResponse(responseCode = "401", description = "Authentification échouée")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        try {
            User user = authenticationService.authenticate(email, password);
            String token = jwtService.generateToken(
                    user.getId().toString(),
                    user.getUsername(),
                    email,
                    user.getRole().toString()
            );

            // Création de la réponse contenant le token et les infos utilisateur
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }

    }

    
}
