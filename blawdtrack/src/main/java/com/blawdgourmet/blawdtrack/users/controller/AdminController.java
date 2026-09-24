package com.blawdgourmet.blawdtrack.users.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminDocumentRequest;
import com.blawdgourmet.blawdtrack.users.dto.AdminEliminacionElegibilidadResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationResponse;
import com.blawdgourmet.blawdtrack.users.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Endpoint para registrar administradores (HU-006 / CU-006 / Tarea 86 - T02).
 * Está restringido exclusivamente al rol de Super Usuario mediante @PreAuthorize,
 * apoyado por la validación de roles configurada en SecurityConfig + JwtAuthenticationFilter.
 */
@RestController
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public ResponseEntity<AdminRegistrationResponse> registrarAdministrador(
            @Valid @RequestBody AdminRegistrationRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {

        AdminRegistrationResponse respuesta = adminService.registrarAdministrador(request, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @GetMapping("/{documentType}/{documentNumber}/elegibilidad-eliminacion")
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public ResponseEntity<AdminEliminacionElegibilidadResponse> validarElegibilidadEliminacion(
            @Valid AdminDocumentRequest request) {
        return ResponseEntity.ok(
                adminService.validarElegibilidadEliminacion(request.documentType(), request.documentNumber()));
    }
}
