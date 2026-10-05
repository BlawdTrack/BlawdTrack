package com.blawdgourmet.blawdtrack.packages.search;

import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class PackageSearchTermNormalizer {

    public static final int MAX_TERM_LENGTH = 100;
    public static final char ESCAPE_CHARACTER = '!';

    public Optional<PackageSearchTerm> normalize(String rawTerm) {
        if (rawTerm == null || rawTerm.isBlank()) {
            return Optional.empty();
        }

        String normalized = rawTerm.strip();
        if (normalized.length() > MAX_TERM_LENGTH) {
            normalized = normalized.substring(0, MAX_TERM_LENGTH);
        }
        normalized = normalized.toLowerCase(Locale.ROOT);

        StringBuilder escaped = new StringBuilder(normalized.length());
        for (char character : normalized.toCharArray()) {
            if (character == ESCAPE_CHARACTER || character == '%' || character == '_') {
                escaped.append(ESCAPE_CHARACTER);
            }
            escaped.append(character);
        }

        String digitsPattern = null;
        if (normalized.matches("[0-9+\\- ]+")) {
            String digits = normalized.replaceAll("[^0-9]", "");
            if (!digits.isEmpty()) {
                digitsPattern = "%" + digits + "%";
            }
        }

        return Optional.of(new PackageSearchTerm("%" + escaped + "%", digitsPattern));
    }
}