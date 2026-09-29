package com.blawdgourmet.blawdtrack.users.service;

/**
 * No existe un administrador de ventas con el documento indicado (HU-008). Se responde 404
 * {@code ADMINISTRADOR_NO_EXISTENTE} con el mensaje "Administrador no existente".
 */
public class AdminNotFoundException extends RuntimeException {
    public AdminNotFoundException(String message) {
        super(message);
    }
}
