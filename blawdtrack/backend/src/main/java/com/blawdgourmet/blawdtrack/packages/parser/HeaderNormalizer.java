package com.blawdgourmet.blawdtrack.packages.parser;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Objects;

/** Normaliza encabezados provenientes de CSV o Excel para comparar sus alias. */
final class HeaderNormalizer {

    private HeaderNormalizer() {
    }

    static String normalize(String value) {
        String withoutAccents = Normalizer.normalize(
                        Objects.requireNonNullElse(value, ""), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return withoutAccents.replace("\uFEFF", "")
                .replaceAll("[^A-Za-z0-9]", "")
                .toLowerCase(Locale.ROOT);
    }
}
