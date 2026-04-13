package com.example.webbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import com.example.webbackend.enumerates.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity  // Indique que cette classe est une entité JPA
@Table(name = "users") // Spécifie le nom de la table dans la base de données
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entité représentant un utilisateur")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID unique de l'utilisateur", example = "1")
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    @Schema(description = "Nom de l'utilisateur", example = "John Doe")
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    @Schema(description = "Email de l'utilisateur", example = "john@example.com")
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    @Schema(description = "Mot de passe de l'utilisateur", hidden = true)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Schema(description = "Rôle de l'utilisateur", example = "ADMIN")
    private Role role = Role.USER;
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    @Schema(description = "Image de l'utilisateur")
    private byte[] image;

    /*@OneToMany(mappedBy = "researcher", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(description = "Liste des publications du chercheur")
    private List<Publication> publications;*/

    public User(String username, String email, String password, Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.image = null;
    }

}
