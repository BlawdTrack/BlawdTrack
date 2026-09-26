package com.blawdgourmet.blawdtrack.audit.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Acciones auditables genéricas. El código se persiste en la columna "accion".
 */
@Getter
@RequiredArgsConstructor
public enum AuditAction {

    COURIER_UPDATED("ACTUALIZAR_MENSAJERO"),
    COURIER_DEACTIVATED("DESACTIVAR_MENSAJERO"),
    ADMIN_CREATED("CREAR_ADMINISTRADOR");

    private final String code;
}
