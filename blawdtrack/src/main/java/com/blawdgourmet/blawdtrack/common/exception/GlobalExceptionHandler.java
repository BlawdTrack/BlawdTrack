package com.blawdgourmet.blawdtrack.common.exception;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.blawdgourmet.blawdtrack.common.dto.ApiError;
import com.blawdgourmet.blawdtrack.users.exception.AdminSessionActiveException;
import com.blawdgourmet.blawdtrack.users.service.AdminNotFoundException;

/**
 * Traduce las excepciones de la aplicación al formato unificado de errores (estándar P05).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> manejarValidacion(MethodArgumentNotValidException ex) {
        List<ApiError.CampoError> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> ApiError.CampoError.builder()
                        .campo(fe.getField())
                        .mensaje(fe.getDefaultMessage())
                        .build())
                .toList();

        ApiError error = ApiError.builder()
                .code("VALIDATION_ERROR")
                .message("One or more fields do not meet the required validation rules.")
                .status(HttpStatus.BAD_REQUEST.value())
                .errores(errores)
                .build();

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> manejarDuplicado(DuplicateResourceException ex) {
        ApiError error = ApiError.builder()
                .code(ex.getCode())
                .message(ex.getMessage())
                .status(HttpStatus.CONFLICT.value())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(BusinessConfigurationException.class)
    public ResponseEntity<ApiError> manejarConfiguracion(BusinessConfigurationException ex) {
        ApiError error = ApiError.builder()
                .code("CONFIGURACION_INVALIDA")
                .message(ex.getMessage())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(AdminNotFoundException.class)
    public ResponseEntity<ApiError> manejarAdministradorNoExistente(AdminNotFoundException ex) {
        ApiError error = ApiError.builder()
                .code("ADMINISTRADOR_NO_EXISTENTE")
                .message(ex.getMessage())
                .status(HttpStatus.NOT_FOUND.value())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(AdminSessionActiveException.class)
    public ResponseEntity<ApiError> manejarSesionActiva(AdminSessionActiveException ex) {
        ApiError error = ApiError.builder()
                .code("ADMINISTRADOR_CON_SESION_ACTIVA")
                .message(ex.getMessage())
                .status(HttpStatus.CONFLICT.value())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> manejarAccesoDenegado(AccessDeniedException ex) {
        ApiError error = ApiError.builder()
                .code("ACCESO_DENEGADO")
                .message("You do not have the permissions required to perform this action.")
                .status(HttpStatus.FORBIDDEN.value())
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> manejarGenerico(Exception ex) {
        ApiError error = ApiError.builder()
                .code("INTERNAL_ERROR")
                .message("An unexpected error occurred while processing the request.")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
