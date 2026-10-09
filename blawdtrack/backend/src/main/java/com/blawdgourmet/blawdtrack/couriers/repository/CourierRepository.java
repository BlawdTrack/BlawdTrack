package com.blawdgourmet.blawdtrack.couriers.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;

/** Acceso a los perfiles de mensajero (tabla {@code mensajeros}). */
public interface CourierRepository extends JpaRepository<Courier, Long> {

    /** Perfil asociado a una cuenta de usuario. */
    Optional<Courier> findByUserId(Long userId);

    /** Busca por el número de documento guardado en la cuenta, sin importar el tipo de documento. */
    @EntityGraph(attributePaths = "user")
    Optional<Courier> findByUserDocumentId(String documentId);

    /** Todos los mensajeros (activos e inactivos) ordenados por nombre, con su cuenta ya cargada. */
    @EntityGraph(attributePaths = "user")
    List<Courier> findAllByOrderByUserFullNameAsc();
}
