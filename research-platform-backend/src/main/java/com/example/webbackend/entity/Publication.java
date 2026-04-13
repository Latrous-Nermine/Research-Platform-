package com.example.webbackend.entity;

import com.example.webbackend.enumerates.PublicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.Date;
import java.util.List;

@Entity
@Table(name = "publications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entité représentant une publication")
public class Publication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID unique de la publication", example = "1")
    private Long id;

    @Column(nullable = false, length = 200)
    @Schema(description = "Titre de la publication", example = "Une étude sur l'intelligence artificielle")
    private String title;

    @Column(nullable = true, length = 2000)
    @Schema(description = "Description de la publication", example = "Cette publication traite des avancées récentes en IA")
    private String description;


    @Lob
    @Column(columnDefinition = "LONGBLOB", nullable = true)
    @Schema(description = "Contenu PDF de la publication sous forme de tableau de bytes")
    private byte[] pdfContent ;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Schema(description = "Statut de la publication", example = "PENDING")
    private PublicationStatus status = PublicationStatus.PENDING;

    @Column(nullable = false)
    @Schema(description = "Article premium?", example = "TRUE")
    private Boolean premium=Boolean.TRUE;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @Schema(description = "Chercheur associé à la publication")
    private User researcher;

    @ManyToOne
    @JoinColumn(name = "domain_id", nullable = false)
    @Schema(description = "Domaine de recherche associé à la publication")
    private Domain domain;

    @Column(nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @Schema(description = "Date de création de la publication", example = "2023-01-01T00:00:00")
    private Date creationDate = new Date();


    /*@OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(description = "Liste des commentaires associés à la publication")
    private List<Comment> comments;*/
    /*public Publication(String titre, User id_researcher, Domain id_domain){
        this.title = titre;
        this.researcher =  id_researcher;
        this.domain = id_domain;

    }*/

}

