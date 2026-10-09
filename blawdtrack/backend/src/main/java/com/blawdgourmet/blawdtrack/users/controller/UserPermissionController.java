package com.blawdgourmet.blawdtrack.users.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminDocumentRequest;
import com.blawdgourmet.blawdtrack.users.dto.UpdateUserPermissionsRequest;
import com.blawdgourmet.blawdtrack.users.dto.UserPermissionsResponse;
import com.blawdgourmet.blawdtrack.users.service.UserPermissionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Permisos individuales de un usuario (HU-009), exclusivos del Super Usuario. El usuario se
 * identifica por su documento, sin importar su rol; se reutiliza {@link AdminDocumentRequest}
 * porque solo enlaza y valida el tipo y número de documento de la ruta.
 */
@RestController
@RequestMapping("/api/v1/users/{documentType}/{documentNumber}/permissions")
@RequiredArgsConstructor
public class UserPermissionController {

    private final UserPermissionService service;

    @GetMapping
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public UserPermissionsResponse get(@Valid AdminDocumentRequest user) {
        return service.get(user.documentType(), user.documentNumber());
    }

    @PutMapping
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public UserPermissionsResponse replace(@Valid AdminDocumentRequest user,
                                           @Valid @RequestBody UpdateUserPermissionsRequest request,
                                           @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.replace(user.documentType(), user.documentNumber(), request.permissionCodes(), actor);
    }

    @DeleteMapping
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public UserPermissionsResponse reset(@Valid AdminDocumentRequest user,
                                         @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.reset(user.documentType(), user.documentNumber(), actor);
    }
}
