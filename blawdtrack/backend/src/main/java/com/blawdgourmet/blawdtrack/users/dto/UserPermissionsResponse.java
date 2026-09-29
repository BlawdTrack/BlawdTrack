package com.blawdgourmet.blawdtrack.users.dto;

import java.util.Set;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;

/**
 * Matriz de permisos de un usuario: los de su rol, los efectivos (rol más excepciones individuales)
 * y el alcance dentro del cual se pueden modificar. Un rol no editable tiene alcance vacío.
 */
public record UserPermissionsResponse(Long userId, DocumentType documentType, String documentNumber,
                                      String fullName, String role, boolean editable, boolean customized,
                                      Set<String> rolePermissions, Set<String> effectivePermissions,
                                      Set<String> allowedPermissions) {
}
