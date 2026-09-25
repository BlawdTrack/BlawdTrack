package com.blawdgourmet.blawdtrack.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blawdgourmet.blawdtrack.common.dto.ErrorResponse;
import com.blawdgourmet.blawdtrack.users.dto.RolePermissionsResponse;
import com.blawdgourmet.blawdtrack.users.dto.UpdateRolePermissionsRequest;
import com.blawdgourmet.blawdtrack.users.service.RolePermissionException;
import com.blawdgourmet.blawdtrack.users.service.RolePermissionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RolePermissionController {
    private final RolePermissionService service;

    @PutMapping("/{roleId}/permissions")
    public RolePermissionsResponse replace(@PathVariable Long roleId,
                                           @Valid @RequestBody UpdateRolePermissionsRequest request) {
        return service.replace(roleId, request.permissionIds());
    }

    @ExceptionHandler(RolePermissionException.class)
    public ResponseEntity<ErrorResponse> rolePermissionError(RolePermissionException ex) {
        int status = ex.getStatus().value();
        return ResponseEntity.status(ex.getStatus()).body(ErrorResponse.builder()
                .code("ROLE_PERMISSIONS_ERROR").message(ex.getMessage()).status(status).build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> invalidRequest(MethodArgumentNotValidException ex) {
        return ResponseEntity.badRequest().body(ErrorResponse.builder()
                .code("VALIDATION_ERROR").message("The permissionIds field is required and cannot contain null values")
                .status(400).build());
    }
}
