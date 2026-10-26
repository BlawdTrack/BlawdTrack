package com.blawdgourmet.blawdtrack.users.repository;

import com.blawdgourmet.blawdtrack.users.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** Acceso a los roles (tabla {@code roles}). */
public interface RoleRepository extends JpaRepository<Role, Long> {
    /** Busca un rol por su nombre (ver {@code RoleName}). */
    Optional<Role> findByName(String name);
}