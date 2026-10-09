package com.blawdgourmet.blawdtrack.users.constant;

/**
 * Nombres de los tres roles del sistema, tal como se guardan en la columna {@code roles.nombre} y como
 * aparecen en las autoridades de Spring Security ({@code ROLE_} + nombre).
 * <ul>
 *   <li>{@link #SUPER_USER}: gestiona usuarios, roles y permisos. Sus permisos no se pueden editar.</li>
 *   <li>{@link #SALES_ADMIN}: administrador de ventas, opera paquetes y reportes.</li>
 *   <li>{@link #COURIER}: mensajero, consulta y actualiza los paquetes que tiene asignados.</li>
 * </ul>
 */
public final class RoleName {
    private RoleName() {}

    public static final String SUPER_USER = "SUPER_USUARIO";
    public static final String SALES_ADMIN = "ADMIN_VENTAS";
    public static final String COURIER = "MENSAJERO";
}
