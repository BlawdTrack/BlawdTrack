package com.blawdgourmet.blawdtrack.packages.search;

/**
 * {@code field} limita la búsqueda a un solo campo del paquete y {@code status} a un estado (nombre de
 * {@code PackageStatus}); vacío o desconocido no filtra.
 */
public record PackageSearchQuery(String term, String field, String status, String page, String size) {
}
