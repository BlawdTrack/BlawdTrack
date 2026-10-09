package com.blawdgourmet.blawdtrack.users.dto;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Conjunto deseado de permisos efectivos del usuario, por código. */
public record UpdateUserPermissionsRequest(@NotNull Set<@NotBlank String> permissionCodes) {
}
