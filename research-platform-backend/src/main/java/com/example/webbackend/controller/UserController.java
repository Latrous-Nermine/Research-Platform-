package com.example.webbackend.controller;

import com.example.webbackend.entity.User;
import com.example.webbackend.enumerates.Role;
import com.example.webbackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
@Tag(name = "Utilisateurs", description = "Gestion des utilisateurs")
public class UserController {
    @Autowired
    private UserService userService;

    // Créer un utilisateur (POST)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Créer un nouvel utilisateur",
            description = "Permet d'enregistrer un nouvel utilisateur dans le système"
    )
    @ApiResponse(responseCode = "201", description = "Utilisateur créé avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    public ResponseEntity<User> createUser(
            @Parameter(description = "Nom d'utilisateur")
            @RequestParam("username") String username,

            @Parameter(description = "Email de l'utilisateur")
            @RequestParam("email") String email,

            @Parameter(description = "Mot de passe")
            @RequestParam("password") String password,

            @Parameter(description = "Rôle de l'utilisateur")
            @RequestParam(value = "role", required = false, defaultValue = "USER") Role role,

            @Parameter(description = "Image de profil (optionnelle)")
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) throws IOException {

        // Création de l'utilisateur
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(role);
        if (imageFile != null && !imageFile.isEmpty()) {
            user.setImage(imageFile.getBytes());
        }

        User savedUser = userService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }


    // Récupérer tous les utilisateurs (GET)
    @GetMapping
    @Operation(
            summary = "Récupérer tous les utilisateurs",
            description = "Retourne la liste de tous les utilisateurs enregistrés."
    )
    @ApiResponse(responseCode = "200", description = "Liste des utilisateurs récupérée avec succès")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Récupérer un utilisateur par ID (GET)
    @GetMapping("/{id}")
    @Operation(
            summary = "Récupérer un utilisateur par ID",
            description = "Retourne les détails d'un utilisateur spécifique en fonction de son ID."
    )
    @ApiResponse(responseCode = "200", description = "Utilisateur trouvé")
    @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-role")
    @Operation(
            summary = "Récupérer une liste d'utilisateurs par role",
            description = "Retourne la liste des utilisateurs selon role."
    )
    @ApiResponse(responseCode = "200", description = "Liste des utilisateurs par role récupérée avec succès")
    public ResponseEntity<List<User>> getUsersByRole(@RequestParam  Role role){
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // Mettre à jour un utilisateur (PUT)
    @PutMapping("/{id}")
    @Operation(
            summary = "Mettre à jour un utilisateur",
            description = "Permet de mettre à jour les informations d'un utilisateur existant en fonction de son ID."
    )
    @ApiResponse(responseCode = "200", description = "Utilisateur mis à jour avec succès")
    @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Supprimer un utilisateur (DELETE)
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Supprimer un utilisateur",
            description = "Permet de supprimer un utilisateur en fonction de son ID."
    )
    @ApiResponse(responseCode = "204", description = "Utilisateur supprimé avec succès")
    @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}