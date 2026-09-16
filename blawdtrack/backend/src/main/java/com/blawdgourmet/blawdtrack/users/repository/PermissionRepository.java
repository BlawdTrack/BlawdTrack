package com.blawdgourmet.blawdtrack.users.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blawdgourmet.blawdtrack.users.model.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByCode(String code);
}