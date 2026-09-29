package com.blawdgourmet.blawdtrack.audit.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;

/** Acceso al historial de auditoría (tabla {@code auditorias}). */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
