package com.blawdgourmet.blawdtrack.couriers.repository;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourierRepository extends JpaRepository<Courier, Long> {

    Optional<Courier> findByUserId(Long userId);

    @EntityGraph(attributePaths = "user")
    List<Courier> findAllByOrderByUserFullNameAsc();
}
