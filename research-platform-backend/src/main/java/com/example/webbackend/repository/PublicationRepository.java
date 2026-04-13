package com.example.webbackend.repository;

import com.example.webbackend.entity.Publication;
import com.example.webbackend.entity.User;
import com.example.webbackend.enumerates.PublicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {
    List<Publication> findByStatus(PublicationStatus status);
    List<Publication> findByDomainId(Long domainId);
    @Query("select p from Publication p where p.researcher =?1")
    List<Publication> findByResearcherId(User user);
}
