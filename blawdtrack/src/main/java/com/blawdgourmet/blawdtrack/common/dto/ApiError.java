package com.blawdgourmet.blawdtrack.common.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

/**
 * Formato unificado de respuesta de error para toda la API (estándar P05 - IS-011).
 */
@Getter
@Builder
public class ApiError {

    private final String code;
    private final String message;
    private final int status;

    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();

    private final List<CampoError> errores;

    @Getter
    @Builder
    public static class CampoError {
        private final String campo;
        private final String mensaje;
    }
}
