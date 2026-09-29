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

    /**
     * Credenciales incorrectas: 401 con código {@code INVALID_CREDENTIALS}, sin decir si falló el correo o la
     * contraseña (AuthService ya generaliza el mensaje).
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .code("INVALID_CREDENTIALS")
                .message(ex.getMessage())
                .status(HttpStatus.UNAUTHORIZED.value())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Inactive account with correct credentials: 403, its own code so the
    // frontend can tell the two cases apart without parsing the message
    // (AuthenticationManager only reaches this handler after the password
    // already matched, so this never reveals the account's status to
    // someone who does not know it; see SecurityConfig.authenticationManager()).
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabledAccount(DisabledException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .code("ACCOUNT_INACTIVE")
                .message(ex.getMessage())
                .status(HttpStatus.FORBIDDEN.value())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
}