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
    COURIER_ACTIVATED("ACTIVAR_MENSAJERO"),
    COURIER_PASSWORD_CHANGED("CAMBIAR_CONTRASENA_MENSAJERO"),
    ADMIN_CREATED("CREAR_ADMINISTRADOR"),
    USER_PERMISSIONS_UPDATED("ACTUALIZAR_PERMISOS_USUARIO"),
    USER_PERMISSIONS_RESET("RESTABLECER_PERMISOS_USUARIO");

    private final String code;

    public String getCode() {
        return code;
    }
}
