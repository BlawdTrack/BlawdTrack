package com.blawdgourmet.blawdtrack.couriers.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;

public interface CourierRepository extends JpaRepository<Courier, Long> {

    Optional<Courier> findByUserId(Long userId);

    @EntityGraph(attributePaths = "user")
    Optional<Courier> findByUserDocumentId(String documentId);
}
