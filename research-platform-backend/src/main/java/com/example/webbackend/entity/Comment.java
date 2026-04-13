package com.example.webbackend.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entité représentant un commentaire d'une publication")

public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID unique du commentaire", example = "1")
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @Schema(description = "ID unique de l'utilisateur rédigeant le commentaire", example = "1")
    private User user;
    @ManyToOne
    @JoinColumn(name = "publication_id", nullable = false)
    @Schema(description = "ID unique de publication à laquelle appartient le commentaire", example = "1")
    private Publication publication;
    @Column(nullable = false, columnDefinition = "TEXT")
    @Schema(description = "Contenu du commentaire", example = "Très bon article !")
    private String content;
    @Column(nullable = false)
    @Schema(description = "Date de rédaction du commentaire", example = "2024-03-02T14:30:00")
    private LocalDateTime createdAt = LocalDateTime.now();
}
