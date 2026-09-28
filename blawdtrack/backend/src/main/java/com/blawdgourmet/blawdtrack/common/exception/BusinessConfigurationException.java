package com.blawdgourmet.blawdtrack.common.exception;

/**
 * Se lanza cuando no se cumple una precondición de configuración de negocio
 * (por ejemplo, un rol requerido que aún no está registrado en la tabla "roles").
 * Se mapea a HTTP 500 porque representa un problema de datos/configuración del sistema,
 * no un error atribuible a la solicitud del usuario.
 */
public class BusinessConfigurationException extends RuntimeException {
    public BusinessConfigurationException(String message) {
        super(message);
    }
}
