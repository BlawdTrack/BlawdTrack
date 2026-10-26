package com.blawdgourmet.blawdtrack.users.service;

import org.springframework.http.HttpStatus;

/**
 * Error al modificar los permisos de un rol (HU-009): rol inexistente (404), permisos inexistentes
 * (400) o permisos fuera del alcance del rol (403). Lleva el estado HTTP que debe responderse.
 */
public class RolePermissionException extends RuntimeException {
    private final HttpStatus status;

    public RolePermissionException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
