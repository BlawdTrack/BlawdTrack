package com.blawdgourmet.blawdtrack.common.exception;

import static org.assertj.core.api.Assertions.assertThat;

import com.blawdgourmet.blawdtrack.common.dto.ApiError;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void archivoDemasiadoGrandeDevuelveRespuestaControlada() {
        ResponseEntity<ApiError> response = handler.manejarArchivoDemasiadoGrande(
                new MaxUploadSizeExceededException(10L * 1024 * 1024));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("PACKAGE_FILE_TOO_LARGE");
        assertThat(response.getBody().getStatus()).isEqualTo(413);
    }
}
