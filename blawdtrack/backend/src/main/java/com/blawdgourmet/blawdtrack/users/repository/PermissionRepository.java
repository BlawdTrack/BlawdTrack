package com.blawdgourmet.blawdtrack.users.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blawdgourmet.blawdtrack.users.model.Permission;

/** Acceso al catálogo de permisos (tabla {@code permisos}). */
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    /** Busca un permiso por su código único. */
    Optional<Permission> findByCode(String code);
}
