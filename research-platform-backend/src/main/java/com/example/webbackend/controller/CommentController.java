package com.example.webbackend.controller;

import com.example.webbackend.config.JwtService;
import com.example.webbackend.entity.Comment;
import com.example.webbackend.entity.Publication;
import com.example.webbackend.entity.User;
import com.example.webbackend.service.CommentService;
import com.example.webbackend.service.PublicationService;
import com.example.webbackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor

@RequestMapping("/comments")
@Tag(name="Commentaire", description = "Gestion des commentaires")
public class CommentController {
    @Autowired
    private CommentService commentService;
    private UserService userService;
    private JwtService jwtService;
    private PublicationService publicationService;


    @PostMapping
    @Operation(
            summary = "Créer un commentaire",
            description = "Permet d'enregistrer un nouveau commentaire dans le système." +
                    "input format:" +
                    "{\n" +
                    "  \"publicationId\": 1,\n" +
                    "  \"userId\": 1,\n" +
                    "  \"content\": \"Excellent travail, merci pour l'article !\"\n" +
                    "}"
    )
    @ApiResponse(responseCode = "200", description = "Commentaire créé avec succès")
    @ApiResponse(responseCode = "400", description = "Requête invalide")
    public ResponseEntity<?> createComment(@RequestBody Map<String, Object> payload) {
        try {
            Long publicationId = Long.valueOf(payload.get("publicationId").toString());
            Long userId = Long.valueOf(payload.get("userId").toString());
            String content = payload.get("content").toString();

            // Récupérer la publication
            Publication publication = publicationService.getPublicationById(publicationId)
                    .orElseThrow(() -> new RuntimeException("Publication not found"));

            // Récupérer l'utilisateur
            User user = userService.getUserById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Créer le commentaire
            Comment comment = new Comment();
            comment.setPublication(publication);
            comment.setUser(user);
            comment.setContent(content);

            Comment savedComment = commentService.createComment(comment);
            return ResponseEntity.ok(savedComment);

        } catch (Exception e) {
            return ResponseEntity.status(400).body("Erreur lors de la création du commentaire : " + e.getMessage());
        }
    }



    // Récupérer tous les commentaire d'une publication (GET)
    @GetMapping
    @Operation(
            summary = "Récupérer tous les commentaires d'une publication",
            description = "Retourne la liste de tous les commentaires enregistrés d'une publication."
    )
    @ApiResponse(responseCode = "200", description = "Liste des commentaires récupérée avec succès")
    public ResponseEntity<List<Map<String, Object>>> getAllCommentsByPublication(@RequestParam Long publicationId) {
        return ResponseEntity.ok(commentService.getCommentsByPublication(publicationId));
    }

    @PutMapping
    @Operation(
            summary = "Mettre à jour un commentaire",
            description = "Permet de mettre à jour le contenu d'un commentaire existant en fonction de son ID." +
                    "format: {\n" +
                    "  \"commentId\": 5,\n" +
                    "  \"content\": \"Contenu mis à jour du commentaire.\"\n" +
                    "}"
    )
    @ApiResponse(responseCode = "200", description = "Commentaire mis à jour avec succès")
    @ApiResponse(responseCode = "404", description = "Commentaire non trouvé")
    public ResponseEntity<?> updateComment(@RequestBody Map<String, Object> payload) {
        try {
            Long commentId = Long.valueOf(payload.get("commentId").toString());
            String newContent = payload.get("content").toString();

            // Récupérer le commentaire existant

            Comment comment = commentService.getCommentById(commentId);


            // Mettre à jour le contenu
            comment.setContent(newContent);
            comment.setCreatedAt(LocalDateTime.now()); // si tu veux aussi mettre à jour la date

            Comment updatedComment = commentService.updateComment(comment);
            return ResponseEntity.ok(updatedComment);

        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Erreur de mise à jour : " + e.getMessage());
        }
    }

    @DeleteMapping("/{commentId}")
    @Operation(
            summary = "Supprimer un commentaire",
            description = "Permet de supprimer un commentaire en fonction de son ID."
    )
    @ApiResponse(responseCode = "204", description = "Commentaire supprimé avec succès")
    @ApiResponse(responseCode = "404", description = "Commentaire non trouvé")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
