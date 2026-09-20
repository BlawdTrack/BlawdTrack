package com.blawdgourmet.blawdtrack.couriers.controller;

import com.blawdgourmet.blawdtrack.common.dto.ErrorResponse;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.couriers.dto.CreateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierResponse;
import com.blawdgourmet.blawdtrack.couriers.dto.UpdateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.service.CourierNotFoundException;
import com.blawdgourmet.blawdtrack.couriers.service.CourierService;
import com.blawdgourmet.blawdtrack.couriers.service.DuplicateCourierException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/couriers")
@RequiredArgsConstructor
public class CourierController {
    private final CourierService service;

    @PostMapping
    public ResponseEntity<CourierResponse> register(@Valid @RequestBody CreateCourierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(request));
    }

    @PutMapping("/{nationalId}")
    public CourierResponse update(@PathVariable String nationalId,
                                  @Valid @RequestBody UpdateCourierRequest request,
                                  @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.update(nationalId, request, actor);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> invalidRequest(MethodArgumentNotValidException ex) {
        // No incluir valores rechazados: podrían contener la contraseña.
        String fields = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField()).distinct().sorted()
                .collect(java.util.stream.Collectors.joining(", "));
        return ResponseEntity.badRequest().body(ErrorResponse.builder().code("VALIDATION_FAILED")
                .message("Revise los campos: " + fields).status(400).build());
    }

    @ExceptionHandler(DuplicateCourierException.class)
    public ResponseEntity<ErrorResponse> duplicate(DuplicateCourierException ex) {
        return conflict(ex.getMessage());
    }

    @ExceptionHandler(CourierNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(CourierNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse.builder()
                .code("COURIER_NOT_FOUND").message(ex.getMessage()).status(404).build());
    }

    // Las restricciones únicas también protegen frente a registros simultáneos.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> integrityConflict(DataIntegrityViolationException ex) {
        return conflict("Los datos del mensajero entran en conflicto con un registro existente");
    }

    private ResponseEntity<ErrorResponse> conflict(String message) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse.builder()
                .code("COURIER_CONFLICT").message(message).status(409).build());
    }
}
