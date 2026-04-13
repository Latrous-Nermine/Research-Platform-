package com.example.webbackend.service;

import com.example.webbackend.entity.Publication;
import com.example.webbackend.enumerates.PublicationStatus;
import com.example.webbackend.repository.PublicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PublicationService {
    private final PublicationRepository publicationRepository;

    @Autowired
    public PublicationService(PublicationRepository publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

    public List<Publication> getAllPublications() {
        return publicationRepository.findAll();
    }

    public Optional<Publication> getPublicationById(Long id) {
        return publicationRepository.findById(id);
    }

    public List<Publication> getPublicationsByDomain(Long domainId) {
        return publicationRepository.findByDomainId(domainId);
    }

    public Publication createPublication(Publication publication) {
        publication.setStatus(PublicationStatus.PENDING); // Par défaut, en attente
        return publicationRepository.save(publication);
    }

    public Publication updatePublicationStatus(Long id, PublicationStatus status) {
        Optional<Publication> publicationOpt = publicationRepository.findById(id);
        if (publicationOpt.isPresent()) {
            Publication publication = publicationOpt.get();
            publication.setStatus(status);
            return publicationRepository.save(publication);
        }
        return null;
    }

    public Publication updatePublicationPremiumStatus(Long id, boolean premium) {
        Optional<Publication> publicationOpt = publicationRepository.findById(id);
        if (publicationOpt.isPresent()) {
            Publication publication = publicationOpt.get();
            publication.setPremium(premium);
            return publicationRepository.save(publication);
        }
        return null;
    }

    public Publication updatePublication(Long id, Publication publicationDetails) {
        return publicationRepository.findById(id).map(publication -> {
            publication.setDomain(publicationDetails.getDomain());
            publication.setTitle(publicationDetails.getTitle());
            publication.setDescription(publicationDetails.getDescription());

            return publicationRepository.save(publication);
        }).orElseThrow(() -> new RuntimeException("Publication non trouvé"));
    }

    public void deletePublication(Long id) {
        publicationRepository.deleteById(id);
    }
}
