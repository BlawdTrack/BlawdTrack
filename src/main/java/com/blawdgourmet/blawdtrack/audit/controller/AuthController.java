package com.blawdgourmet.blawdtrack.audit.controller;

import com.blawdgourmet.blawdtrack.audit.dto.LoginRequest;
import com.blawdgourmet.blawdtrack.audit.dto.LoginResponse;
import com.blawdgourmet.blawdtrack.audit.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for the Security and Access module (HU-001 / CU-001).
 * Exposes the endpoint that receives the login credentials sent from the
 * frontend and returns the result of the authentication.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Processes the received email and password, validates the credentials
     * against the database and, if they are correct and the account is
     * active, returns a JWT token along with the basic data of the
     * authenticated user so the frontend can redirect based on their role.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = authService.login(loginRequest);
        return ResponseEntity.ok(loginResponse);
    }
}
