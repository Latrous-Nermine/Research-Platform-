package com.example.webbackend.service;

import com.example.webbackend.entity.User;
import com.example.webbackend.repository.UserRepository;
import com.example.webbackend.config.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User authenticate(String email, String password) {
        // Validation des entrées
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            throw new RuntimeException("L'email et le mot de passe sont obligatoires.");
        }

        // Recherche de l'utilisateur par email
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Email ou mot de passe incorrect !");
        }

        User user = userOptional.get();

        // Vérification du mot de passe
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect !");
        }

        return user;
    }
}