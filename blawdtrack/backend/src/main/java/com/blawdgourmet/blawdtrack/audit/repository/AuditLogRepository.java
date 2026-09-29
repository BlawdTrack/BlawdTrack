package com.blawdgourmet.blawdtrack.audit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Desvincula los registros de auditoría del usuario afectado para poder eliminarlo sin
     * perder la traza: el detalle de cada registro conserva el documento y el nombre.
     */
    @Modifying(flushAutomatically = true)
    @Query("update AuditLog a set a.usuarioAfectado = null where a.usuarioAfectado.id = :userId")
    int detachAffectedUser(@Param("userId") Long userId);
}
