package com.example.webbackend.controller;

import com.example.webbackend.entity.Domain;
import com.example.webbackend.entity.Publication;
import com.example.webbackend.entity.User;
import com.example.webbackend.enumerates.PublicationStatus;
import com.example.webbackend.service.PublicationService;
import com.example.webbackend.service.UserService;
import com.example.webbackend.service.DomainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/publications")
@Tag(name = "Publications", description = "Gestion des publications de recherche")
public class PublicationController {

    private final PublicationService publicationService;
    private final UserService userService;
    private final DomainService domainService;

    public PublicationController(PublicationService publicationService, UserService userService, DomainService domainService) {
        this.publicationService = publicationService;
        this.userService = userService;
        this.domainService = domainService;
    }

    /**
     * Récupérer toutes les publications.
     *
     * @return La liste des publications.
     */
    @GetMapping
    @Operation(
            summary = "Récupérer toutes les publications",
            description = "Retourne la liste de toutes les publications disponibles."
    )
    @ApiResponse(responseCode = "200", description = "Liste des publications récupérée avec succès")
    public ResponseEntity<List<Publication>> getAllPublications() {
        List<Publication> publications = publicationService.getAllPublications();
        return ResponseEntity.ok(publications);
    }

    /**
     * Récupérer une publication par son ID.
     *
     * @param id L'ID de la publication.
     * @return La publication correspondante.
     */
    @GetMapping("/{id}")
    @Operation(
            summary = "Récupérer une publication par son ID",
            description = "Retourne les détails d'une publication spécifique en fonction de son ID."
    )
    @ApiResponse(responseCode = "200", description = "Publication trouvée")
    @ApiResponse(responseCode = "404", description = "Publication non trouvée")
    public ResponseEntity<Publication> getPublicationById(
            @Parameter(description = "ID de la publication", example = "1")
            @PathVariable Long id) {
        Optional<Publication> publication = publicationService.getPublicationById(id);

        // Vérifier si la publication existe
        if (publication.isPresent()) {
            return ResponseEntity.ok(publication.get()); // Retourner la publication avec un statut 200 OK
        } else {
            return ResponseEntity.notFound().build(); // Retourner un statut 404 Not Found si la publication n'existe pas
        }
    }

    /**
     * Créer une nouvelle publication.
     *
     * @return La publication créée.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Créer une nouvelle publication",
            description = "Permet à un chercheur de créer une nouvelle publication."
    )
    @ApiResponse(responseCode = "201", description = "Publication créée avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé (rôle non autorisé)")
    public ResponseEntity<Publication> createPublication(
            @Parameter(description = "Titre de la publication")
            @RequestParam("title") String title,

            @Parameter(description = "Description de la publication")
            @RequestParam("description") String description,

            @Parameter(description = "Fichier PDF de la publication")
            @RequestParam(value = "pdfFile", required = false) MultipartFile pdfFile,

            @Parameter(description = "Statut de la publication")
            @RequestParam("status") PublicationStatus status,

            @Parameter(description = "Est-ce une publication premium ?")
            @RequestParam("premium") Boolean premium,

            @Parameter(description = "ID du chercheur associé")
            @RequestParam("researcherId") Long researcherId,

            @Parameter(description = "ID du domaine de recherche")
            @RequestParam("domainId") Long domainId
    ) throws IOException {
        User researcher = userService.getUserById(researcherId)
                .orElseThrow(() -> new RuntimeException("Chercheur non trouvé avec l'ID : " + researcherId));

        Domain domain = domainService.getDomainById(domainId)
                .orElseThrow(() -> new RuntimeException("Domaine non trouvé avec l'ID : " + domainId));


        Publication publication = new Publication();
        publication.setTitle(title);
        publication.setDescription(description);
        publication.setPdfContent(pdfFile != null ? pdfFile.getBytes() : null);
        publication.setStatus(status);
        publication.setPremium(premium);
        publication.setResearcher(researcher);
        publication.setDomain(domain);

        Publication created = publicationService.createPublication(publication);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
















    /**
     * Mettre à jour le statut d'une publication existante.
     *
     * @param id     L'ID de la publication à mettre à jour.
     * @param status Le nouveau statut de la publication.
     * @return La publication mise à jour.
     */
    @PutMapping("/{id}/status")
    @Operation(
            summary = "Mettre à jour le statut d'une publication",
            description = "Permet à un chercheur de mettre à jour le statut d'une publication existante."
    )
    @ApiResponse(responseCode = "200", description = "Statut de la publication mis à jour avec succès")
    @ApiResponse(responseCode = "404", description = "Publication non trouvée")
    @ApiResponse(responseCode = "403", description = "Accès refusé (rôle non autorisé)")
    public ResponseEntity<Publication> updatePublicationStatus(
            @Parameter(description = "ID de la publication", example = "1")
            @PathVariable Long id,
            @Parameter(description = "Nouveau statut de la publication", example = "PUBLISHED")
            @RequestBody PublicationStatus status) {
        Publication updatedPublication = publicationService.updatePublicationStatus(id, status);
        return ResponseEntity.ok(updatedPublication);
    }

    @PutMapping("/{publicationId}")
    @Operation(
            summary = "Mettre à jour une publication",
            description = "Permet de mettre à jour une publication existant en fonction de son ID."
    )
    @ApiResponse(responseCode = "200", description = "Publication mis à jour avec succès")
    @ApiResponse(responseCode = "404", description = "Publication non trouvé")
    public ResponseEntity<Publication> updatePublication(@PathVariable Long publicationId, @RequestBody Publication publicationDetails) {
        try {
            Publication updatedPublication= publicationService.updatePublication(publicationId, publicationDetails);
            return ResponseEntity.ok(updatedPublication);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/premium")
    @Operation(
            summary = "Mettre à jour le statut premium d'une publication",
            description = "Permet à un administrateur ou à un utilisateur autorisé de mettre à jour le statut premium d'une publication existante."
    )
    @ApiResponse(responseCode = "200", description = "Statut premium de la publication mis à jour avec succès")
    @ApiResponse(responseCode = "404", description = "Publication non trouvée")
    @ApiResponse(responseCode = "403", description = "Accès refusé (rôle non autorisé)")
    public ResponseEntity<Publication> updatePublicationPremiumStatus(
            @Parameter(description = "ID de la publication", example = "1")
            @PathVariable Long id,
            @Parameter(description = "Nouveau statut premium de la publication", example = "true")
            @RequestBody boolean premium) {
        Publication updatedPublication = publicationService.updatePublicationPremiumStatus(id, premium);
        return ResponseEntity.ok(updatedPublication);
    }





    /**
     * Supprimer une publication.
     *
     * @param id L'ID de la publication à supprimer.
     * @return Réponse HTTP 204 (No Content).
     */
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Supprimer une publication",
            description = "Permet à un chercheur de supprimer une publication existante."
    )
    @ApiResponse(responseCode = "204", description = "Publication supprimée avec succès")
    @ApiResponse(responseCode = "404", description = "Publication non trouvée")
    @ApiResponse(responseCode = "403", description = "Accès refusé (rôle non autorisé)")
    public ResponseEntity<Void> deletePublication(
            @Parameter(description = "ID de la publication", example = "1")
            @PathVariable Long id) {
        publicationService.deletePublication(id);
        return ResponseEntity.noContent().build();
    }
}