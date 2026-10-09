package com.blawdgourmet.blawdtrack.users.repository;

import com.blawdgourmet.blawdtrack.users.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
}