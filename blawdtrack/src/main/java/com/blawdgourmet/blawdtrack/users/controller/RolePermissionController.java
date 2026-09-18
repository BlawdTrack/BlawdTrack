package com.blawdgourmet.blawdtrack.users.controller;

import com.blawdgourmet.blawdtrack.common.dto.ErrorResponse;
import com.blawdgourmet.blawdtrack.users.dto.RolePermissionsResponse;
import com.blawdgourmet.blawdtrack.users.dto.UpdateRolePermissionsRequest;
import com.blawdgourmet.blawdtrack.users.service.RolePermissionException;
import com.blawdgourmet.blawdtrack.users.service.RolePermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

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
                .code("VALIDATION_FAILED").message("El campo permissionIds es obligatorio y no admite valores nulos")
                .status(400).build());
    }
}
