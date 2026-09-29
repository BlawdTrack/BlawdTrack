package com.blawdgourmet.blawdtrack.users.dto;

import java.util.Set;

/** Permisos que quedaron asignados a un rol después de actualizarlo (HU-009), por código. */
public record RolePermissionsResponse(Long roleId, String role, Set<String> permissions) {
}
