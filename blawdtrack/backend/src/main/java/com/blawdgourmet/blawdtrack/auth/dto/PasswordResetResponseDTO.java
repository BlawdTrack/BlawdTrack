package com.blawdgourmet.blawdtrack.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Respuesta pública de POST /api/v1/auth/password-reset/request (Task #62).
 * <p>
 * Es intencionalmente siempre el mismo mensaje neutro, exista o no el correo
 * y esté o no activa la cuenta: revelar esa diferencia permitiría enumerar
 * correos registrados en el sistema. La lógica que decide si se genera el
 * token vive únicamente en el service, nunca en esta respuesta.
 */
@Getter
@Builder
@AllArgsConstructor
public class PasswordResetResponseDTO {
    private String message;
}
