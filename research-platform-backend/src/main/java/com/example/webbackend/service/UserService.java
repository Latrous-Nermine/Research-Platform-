package com.example.webbackend.service;

import com.example.webbackend.entity.User;
import com.example.webbackend.enumerates.Role;
import com.example.webbackend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    //  Créer un utilisateur w zedet fazet l cryptage marra wahda
    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));// Encode le mot de passe
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        return userRepository.save(user);
    }

    // Récupérer tous les utilisateurs
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Récupérer un utilisateur par ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // Mettre à jour un utilisateur
   public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword())); // Réencoder si changement
            }
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    // ✅ Supprimer un utilisateur
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    //Afficher les users par role
    public  List<User> getUsersByRole(Role role){
        return userRepository.getUsersByRole(role);
    }
}
