package com.blawdgourmet.blawdtrack.common.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

/**
* Unified error response format for the entire API (P05 standard - IS-011).
 */
@Getter
@Builder
public class ApiError {

    private String code;
    private String message;
    private int status;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    private List<CampoError> errores;

    @Getter
    @Builder
    public static class CampoError {
        private String campo;
        private String mensaje;
    }
}
