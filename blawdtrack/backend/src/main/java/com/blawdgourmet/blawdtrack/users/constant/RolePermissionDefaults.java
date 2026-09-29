package com.blawdgourmet.blawdtrack.users.constant;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Fuente única de los permisos predeterminados de los roles operativos. Son también su alcance:
 * un rol operativo no puede recibir permisos fuera de este conjunto, ni por rol ni por usuario.
 * El Super Usuario no es editable, por eso no aparece aquí.
 */
public final class RolePermissionDefaults {

    private static final Map<String, Set<String>> OPERATIONAL = Map.of(
            RoleName.SALES_ADMIN, Set.of(
                    PermissionCode.PACKAGE_IMPORT, PermissionCode.PACKAGE_DELETE,
                    PermissionCode.PACKAGE_VIEW, PermissionCode.PACKAGE_SEARCH,
                    PermissionCode.PACKAGE_EXPORT, PermissionCode.PACKAGE_GENERATE_QR,
                    PermissionCode.PACKAGE_ASSIGN, PermissionCode.REPORT_VIEW,
                    PermissionCode.REPORT_PRINT, PermissionCode.PROOF_OF_DELIVERY_VIEW,
                    PermissionCode.COST_VIEW),
            RoleName.COURIER, Set.of(
                    PermissionCode.PACKAGE_VIEW_ASSIGNED,
                    PermissionCode.PACKAGE_UPDATE_STATUS,
                    PermissionCode.TRIP_COST_REGISTER));

    private RolePermissionDefaults() {
    }

    /** Permisos predeterminados (y alcance) del rol, o vacío si el rol no es editable. */
    public static Optional<Set<String>> forRole(String roleName) {
        return Optional.ofNullable(OPERATIONAL.get(roleName));
    }
}
