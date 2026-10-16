package com.blawdgourmet.blawdtrack.users.dto;

import java.util.Locale;

import com.blawdgourmet.blawdtrack.users.model.UserStatus;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de {@code PATCH /api/v1/admins/{documentType}/{documentNumber}} (HU-007): los cambios al perfil de un
 * administrador. Todos los campos son opcionales y solo se aplican los que lleguen, pero debe llegar al menos uno.
 * El documento y el rol no se modifican. Los textos se limpian igual que en el registro.
 */
public record AdminUpdateRequest(
        @Size(min = 1, max = 120, message = "Full name must have between 1 and 120 characters.") String fullName,
        @Email(message = "Email address is not valid.")
        @Size(max = 120, message = "Email cannot exceed 120 characters.") String email,
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "La contraseña debe tener al menos 8 caracteres y combinar letras y números")
        String password,
        UserStatus status
) {

    public AdminUpdateRequest {
        fullName = fullName == null ? null : fullName.trim();
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    @AssertTrue(message = "At least one field to update is required.")
    public boolean isAnyFieldPresent() {
        return (fullName != null && !fullName.isEmpty()) || email != null || password != null || status != null;
    }

    @Override
    public String toString() {
        // La contraseña nunca debe quedar en un registro.
        return "AdminUpdateRequest[fullName=" + fullName + ", email=" + email + ", password=" + (password == null ? null : "***")
                + ", status=" + status + "]";
    }
}
