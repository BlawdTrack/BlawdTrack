package com.blawdgourmet.blawdtrack.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blawdgourmet.blawdtrack.auth.dto.PasswordResetConfirmRequest;
import com.blawdgourmet.blawdtrack.auth.dto.PasswordResetRequestDTO;
import com.blawdgourmet.blawdtrack.auth.dto.PasswordResetResponseDTO;
import com.blawdgourmet.blawdtrack.auth.service.PasswordResetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Solicitud de recuperación de contraseña (Task #62).
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private static final String GENERIC_MESSAGE =
            "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.";

    private final PasswordResetService passwordResetService;

    /**
     * Siempre responde 200 con el mismo mensaje genérico, exista o no el
     * correo y esté o no activa la cuenta: el resultado del service (que sí
     * distingue esos casos) no se expone aquí, para no permitir enumerar
     * correos registrados en el sistema.
     */
    @PostMapping("/password-reset/request")
    public ResponseEntity<PasswordResetResponseDTO> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequestDTO request) {
        passwordResetService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(PasswordResetResponseDTO.builder().message(GENERIC_MESSAGE).build());
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<PasswordResetResponseDTO> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request) {
        passwordResetService.confirmPasswordReset(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(PasswordResetResponseDTO.builder()
                .message("Contraseña actualizada correctamente.")
                .build());
    }
}
