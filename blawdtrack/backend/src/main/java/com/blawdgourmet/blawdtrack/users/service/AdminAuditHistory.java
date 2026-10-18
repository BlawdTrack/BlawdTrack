package com.blawdgourmet.blawdtrack.users.service;

import java.util.List;

import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;

/** Puerto de lectura del historial de administradores (altas, modificaciones y bajas); lo implementa el módulo de auditoría. */
public interface AdminAuditHistory {

    /** Todo lo registrado sobre administradores, del más reciente al más antiguo. */
    List<AdminAuditLogResponse> adminHistory();

    /** Lo registrado sobre un administrador en particular, del más reciente al más antiguo. */
    List<AdminAuditLogResponse> adminHistory(Long adminId);
}
