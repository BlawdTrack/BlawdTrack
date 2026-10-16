package com.blawdgourmet.blawdtrack.users.service;

import java.util.List;

import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;

/** Puerto de lectura del historial de altas y bajas de administradores; lo implementa el módulo de auditoría. */
public interface AdminAuditHistory {

    /** Altas y bajas de administradores, de la más reciente a la más antigua. */
    List<AdminAuditLogResponse> adminHistory();
}
