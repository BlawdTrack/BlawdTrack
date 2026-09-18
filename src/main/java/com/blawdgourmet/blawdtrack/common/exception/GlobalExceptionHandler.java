package com.blawdgourmet.blawdtrack.common.exception;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.blawdgourmet.blawdtrack.audit.exception.InactiveAccountException;
import com.blawdgourmet.blawdtrack.audit.exception.InvalidCredentialsException;
import com.blawdgourmet.blawdtrack.common.dto.ApiError;

/**
* Translates application exceptions to the unified error format (P05 standard).
* This copy covers only the exceptions relevant to the Login module (HU-001).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> manejarCredencialesInvalidas(InvalidCredentialsException ex) {
        ApiError error = ApiError.builder()
                .code("CREDENCIALES_INVALIDAS")
                .message(ex.getMessage())
                .status(HttpStatus.UNAUTHORIZED.value())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(InactiveAccountException.class)
    public ResponseEntity<ApiError> manejarCuentaInactiva(InactiveAccountException ex) {
        ApiError error = ApiError.builder()
                .code("CUENTA_INACTIVA")
                .message(ex.getMessage())
                .status(HttpStatus.FORBIDDEN.value())
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

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
