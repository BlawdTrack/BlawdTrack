package com.blawdgourmet.blawdtrack.auth.controller;

import com.blawdgourmet.blawdtrack.common.dto.ErrorResponse;
import com.blawdgourmet.blawdtrack.auth.dto.LoginRequest;
import com.blawdgourmet.blawdtrack.auth.dto.LoginResponse;
import com.blawdgourmet.blawdtrack.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoint público de inicio de sesión (HU-001).
 * <p>
 * Las credenciales inválidas y las cuentas inactivas se responden con 401 y el código
 * {@code AUTH_FAILED}; el frontend distingue ambos casos por el mensaje.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Autentica al usuario con correo y contraseña.
     *
     * @param request correo y contraseña, validados con Bean Validation
     * @return 200 con el token JWT, los datos básicos del usuario, su rol y sus permisos
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    /** Traduce los fallos de autenticación al formato de error unificado con estado 401. */
    @ExceptionHandler({BadCredentialsException.class, DisabledException.class})
    public ResponseEntity<ErrorResponse> handleAuthenticationError(RuntimeException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .code("AUTH_FAILED")
                .message(ex.getMessage())
                .status(HttpStatus.UNAUTHORIZED.value())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}