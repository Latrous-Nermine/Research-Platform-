package com.example.webbackend.service;
import com.example.webbackend.entity.Domain;
import com.example.webbackend.repository.DomainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DomainService {
    private final DomainRepository domainRepository;

    @Autowired
    public DomainService(DomainRepository domainRepository) {
        this.domainRepository = domainRepository;
    }

    public List<Domain> getAllDomains() {
        return domainRepository.findAll();
    }

    public Optional<Domain> getDomainById(Long id) {
        return domainRepository.findById(id);
    }

    public Domain createDomain(Domain domain) {
        return domainRepository.save(domain);
    }

    public Domain updateDomain(Long id, Domain domainDetails) {
        return domainRepository.findById(id).map(domain -> {
            domain.setName(domainDetails.getName());
            return domainRepository.save(domain);
        }).orElseThrow(() -> new RuntimeException("Domaine non trouvé"));
    }

    public void deleteDomain(Long id) {
        domainRepository.deleteById(id);
    }
}
