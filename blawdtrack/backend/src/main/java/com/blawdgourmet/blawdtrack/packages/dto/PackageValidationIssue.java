package com.blawdgourmet.blawdtrack.packages.dto;

/** Detalla un campo obligatorio ausente en un paquete importado. */
public record PackageValidationIssue(String field, String message) {
}
