package com.blawdgourmet.blawdtrack.common.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * Cuerpo de error simple: {@code code} legible por máquina, {@code message} para el usuario y el
 * estado HTTP. Lo usan los controllers que manejan sus propios errores; el resto de la API usa
 * {@code ApiError}, que además lista los campos inválidos.
 */
@Getter
@Builder
public class ErrorResponse {
    private String code;
    private String message;
    private int status;
}