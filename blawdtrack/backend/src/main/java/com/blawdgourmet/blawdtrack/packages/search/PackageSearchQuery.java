package com.blawdgourmet.blawdtrack.packages.search;

/** {@code field} limita la búsqueda a un solo campo del paquete; vacío o desconocido busca en todos. */
public record PackageSearchQuery(String term, String field, String page, String size) {
}
