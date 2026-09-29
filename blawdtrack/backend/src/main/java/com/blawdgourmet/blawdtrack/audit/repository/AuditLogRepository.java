package com.blawdgourmet.blawdtrack.audit.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByActionInOrderByTimestampDesc(Collection<String> actions);
}
