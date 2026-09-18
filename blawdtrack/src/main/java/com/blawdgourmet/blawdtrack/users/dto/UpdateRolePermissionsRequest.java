package com.blawdgourmet.blawdtrack.users.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Set;

/** Conjunto completo de permisos que tendrá el rol tras la actualización. */
public record UpdateRolePermissionsRequest(@NotNull Set<@NotNull Long> permissionIds) {
}
