package com.blawdgourmet.blawdtrack.couriers.dto;

import java.math.BigDecimal;
import java.util.Locale;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.validation.DocumentHolder;
import com.blawdgourmet.blawdtrack.users.validation.DocumentNormalizer;
import com.blawdgourmet.blawdtrack.users.validation.ValidDocument;
import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@ValidDocument
public record CreateCourierRequest(
        @NotNull DocumentType documentType,
        @JsonAlias({"documentId"}) @NotBlank @Size(max = 50) String documentNumber,
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 120) String email,
        @Size(max = 20) String phone,
        @NotBlank @Size(max = 255) String schedule,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal maxPackageWeightKg
) implements DocumentHolder {
    public CreateCourierRequest {
        documentType = documentType == null ? DocumentType.CEDULA : documentType;
        documentNumber = DocumentNormalizer.normalize(documentType, documentNumber);
        fullName = trim(fullName);
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        phone = trim(phone);
        if (phone != null && phone.isEmpty()) phone = null;
        schedule = trim(schedule);
    }

    @Override
    public DocumentType getDocumentType() {
        return documentType;
    }

    @Override
    public String getDocumentNumber() {
        return documentNumber;
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}