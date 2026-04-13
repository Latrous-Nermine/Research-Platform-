package com.example.webbackend.controller;

import com.example.webbackend.entity.Comment;
import com.example.webbackend.entity.Domain;
import com.example.webbackend.service.DomainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/domains")
@Tag(name = "Domain", description = "Gestion des domaines")
public class DomainController {
    private final DomainService domainService;

    @Autowired
    public DomainController(DomainService domainService) {
        this.domainService = domainService;
    }

    @GetMapping
    @Operation(
            summary = "Récupérer tous les domaines",
            description = "Retourne la liste de tous les domaines enregistrés."
    )
    @ApiResponse(responseCode = "200", description = "Liste des domaines récupérée avec succès")
    public List<Domain> getAllDomains() {
        return domainService.getAllDomains();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Récupérer un domaine par ID",
            description = "Retourne les détails d'un domaine spécifique en fonction de son ID."
    )
    @ApiResponse(responseCode = "200", description = "Domaine trouvé")
    @ApiResponse(responseCode = "404", description = "Domaine non trouvé")
    public ResponseEntity<Domain> getDomainById(@PathVariable Long id) {
        Optional<Domain> domain = domainService.getDomainById(id);
        return domain.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(
            summary = "Créer un domaine",
            description = "Permet d'enregistrer un nouveau domaine dans le système."
    )
    @ApiResponse(responseCode = "200", description = "Domaine créé avec succès")
    @ApiResponse(responseCode = "400", description = "Requête invalide")
    public Domain createDomain(@RequestBody Domain domain) {
        return domainService.createDomain(domain);
    }

    @PutMapping("/{domainId}")
    @Operation(
            summary = "Mettre à jour un domaine",
            description = "Permet de mettre à jour un domaine existant en fonction de son ID."
    )
    @ApiResponse(responseCode = "200", description = "Domaine mis à jour avec succès")
    @ApiResponse(responseCode = "404", description = "Domaine non trouvé")
    public ResponseEntity<Domain> updateDomain(@PathVariable Long domainId, @RequestBody Domain domainDetails) {
        try {
            Domain updatedDomain = domainService.updateDomain(domainId, domainDetails);
            return ResponseEntity.ok(updatedDomain);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Supprimer un domaine",
            description = "Permet de supprimer un domaine en fonction de son ID."
    )
    @ApiResponse(responseCode = "204", description = "Domaine supprimé avec succès")
    @ApiResponse(responseCode = "404", description = "Domaine non trouvé")
    public ResponseEntity<Void> deleteDomain(@PathVariable Long id) {
        domainService.deleteDomain(id);
        return ResponseEntity.noContent().build();
    }




}
