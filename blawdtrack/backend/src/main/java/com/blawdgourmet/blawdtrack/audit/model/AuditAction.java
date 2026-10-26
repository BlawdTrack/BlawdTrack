package com.blawdgourmet.blawdtrack.audit.model;

import java.util.Arrays;
import java.util.List;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Acciones auditables genéricas. El código se persiste en la columna "accion" y la categoría indica a qué historial
 * pertenece (los historiales piden {@link #codesOf(AuditCategory)} en vez de mantener su propia lista).
 */
@Getter
@RequiredArgsConstructor
public enum AuditAction {

    COURIER_CREATED("CREAR_MENSAJERO", AuditCategory.COURIER),
    COURIER_UPDATED("ACTUALIZAR_MENSAJERO", AuditCategory.COURIER),
    COURIER_DEACTIVATED("DESACTIVAR_MENSAJERO", AuditCategory.COURIER),
    COURIER_ACTIVATED("ACTIVAR_MENSAJERO", AuditCategory.COURIER),
    COURIER_PASSWORD_CHANGED("CAMBIAR_CONTRASENA_MENSAJERO", AuditCategory.COURIER),
    ADMIN_CREATED("CREAR_ADMINISTRADOR", AuditCategory.ADMIN),
    ADMIN_UPDATED("ACTUALIZAR_ADMINISTRADOR", AuditCategory.ADMIN),
    ADMIN_DEACTIVATED("DESACTIVAR_ADMINISTRADOR", AuditCategory.ADMIN),
    ADMIN_ACTIVATED("ACTIVAR_ADMINISTRADOR", AuditCategory.ADMIN),
    ADMIN_PASSWORD_CHANGED("CAMBIAR_CONTRASENA_ADMINISTRADOR", AuditCategory.ADMIN),
    ADMIN_DELETED("ELIMINAR_ADMINISTRADOR", AuditCategory.ADMIN),
    USER_PERMISSIONS_UPDATED("ACTUALIZAR_PERMISOS_USUARIO", AuditCategory.USER_PERMISSIONS),
    USER_PERMISSIONS_RESET("RESTABLECER_PERMISOS_USUARIO", AuditCategory.USER_PERMISSIONS),
    PACKAGE_CREATED("REGISTRAR_PAQUETE", AuditCategory.PACKAGE),
    PACKAGE_DELETED("ELIMINAR_PAQUETE", AuditCategory.PACKAGE),
    PACKAGE_STATUS_CHANGED("CAMBIAR_ESTADO_PAQUETE", AuditCategory.PACKAGE),
    PACKAGE_ASSIGNED("ASIGNAR_PAQUETE", AuditCategory.PACKAGE),
    PACKAGE_UNASSIGNED("DESASIGNAR_PAQUETE", AuditCategory.PACKAGE);

    private final String code;
    private final AuditCategory category;

    public String getCode() {
        return code;
    }

    /** Códigos persistidos de todas las acciones de una categoría, en el orden en que se declaran. */
    public static List<String> codesOf(AuditCategory category) {
        return Arrays.stream(values())
                .filter(action -> action.category == category)
                .map(AuditAction::getCode)
                .toList();
    }
}
