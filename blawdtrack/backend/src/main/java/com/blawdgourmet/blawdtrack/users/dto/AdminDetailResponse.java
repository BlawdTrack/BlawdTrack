package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

/**
 * Perfil de un administrador de ventas que el Super Usuario va a modificar (HU-007). Confirma que el administrador
 * existe y trae los datos con los que se precarga el formulario de edición; nunca incluye la contraseña.
 */
public record AdminDetailResponse(
        Long id,
        DocumentType documentType,
        String documentNumber,
        String fullName,
        String email,
        String phone,
        UserStatus status
) {

    public static AdminDetailResponse from(User admin) {
        return new AdminDetailResponse(
                admin.getId(),
                admin.getDocumentType(),
                admin.getDocumentNumber(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getPhone(),
                admin.getStatus()
        );
    }
}
