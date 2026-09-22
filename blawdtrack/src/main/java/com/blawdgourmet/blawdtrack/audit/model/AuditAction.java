package com.blawdgourmet.blawdtrack.audit.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Acciones auditables genéricas. El código se persiste en la columna "accion".
 */
@Getter
@RequiredArgsConstructor
public enum AuditAction {

    COURIER_UPDATED("ACTUALIZAR_MENSAJERO");

    private final String code;
}
