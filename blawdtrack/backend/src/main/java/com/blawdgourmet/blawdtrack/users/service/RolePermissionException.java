package com.blawdgourmet.blawdtrack.users.service;

import org.springframework.http.HttpStatus;

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
