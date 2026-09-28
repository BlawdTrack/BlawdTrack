package com.blawdgourmet.blawdtrack.common.exception;

import lombok.Getter;

/**
 * Se lanza cuando un valor único de negocio (cédula, correo, etc.) ya existe en el sistema.
 * Se mapea a HTTP 409 Conflict.
 */
@Getter
public class DuplicateResourceException extends RuntimeException {

    private final String code;

    public DuplicateResourceException(String code, String message) {
        super(message);
        this.code = code;
    }
}
