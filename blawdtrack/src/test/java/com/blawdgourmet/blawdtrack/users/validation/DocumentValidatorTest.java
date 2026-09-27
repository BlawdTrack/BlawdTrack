package com.blawdgourmet.blawdtrack.users.validation;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

@SuppressWarnings("unused")
class DocumentValidatorTest {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    static Stream<Arguments> validDocuments() {
        return Stream.of(
                Arguments.of(DocumentType.CEDULA, "123456789"),
                Arguments.of(DocumentType.CEDULA, "1-2345-6789"),
                Arguments.of(DocumentType.DIMEX, "123456789"),
                Arguments.of(DocumentType.DIMEX, "12345678901"),
                Arguments.of(DocumentType.DIMEX, "123456789012"),
                Arguments.of(DocumentType.PASAPORTE, "AB123456")
        );
    }

    static Stream<Arguments> invalidDocuments() {
        return Stream.of(
                Arguments.of(DocumentType.CEDULA, "12345678"),
                Arguments.of(DocumentType.CEDULA, "1234567890123"),
                Arguments.of(DocumentType.CEDULA, "12345678A"),
                Arguments.of(DocumentType.DIMEX, "12345678"),
                Arguments.of(DocumentType.DIMEX, "1234567890123"),
                Arguments.of(DocumentType.DIMEX, "12345A78901"),
                Arguments.of(DocumentType.PASAPORTE, "12345678"),
                Arguments.of(DocumentType.PASAPORTE, "AB-1234")
        );
    }

    @ParameterizedTest
    @MethodSource("validDocuments")
    void aceptaDocumentosValidos(DocumentType type, String value) {
        var request = new AdminRegistrationRequest("Nombre", "88888888", "user@example.com", "Clave1234", type, value);
        assertThat(VALIDATOR.validate(request)).isEmpty();
    }

    @ParameterizedTest
    @MethodSource("invalidDocuments")
    void rechazaDocumentosInvalidos(DocumentType type, String value) {
        var request = new AdminRegistrationRequest("Nombre", "88888888", "user@example.com", "Clave1234", type, value);
        assertThat(VALIDATOR.validate(request)).isNotEmpty();
    }

    @Test
    void aceptaValoresNulosSinNpe() {
        var request = new AdminRegistrationRequest("Nombre", "88888888", "user@example.com", "Clave1234", null, null);
        assertThat(VALIDATOR.validate(request)).isNotEmpty();
    }
}
