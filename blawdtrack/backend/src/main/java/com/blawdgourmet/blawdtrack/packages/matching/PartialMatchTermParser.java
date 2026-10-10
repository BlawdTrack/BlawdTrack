package com.blawdgourmet.blawdtrack.packages.matching;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class PartialMatchTermParser {

    public static final int MAX_TERM_LENGTH = 100;
    public static final int MAX_TOKENS = 5;
    public static final char ESCAPE_CHARACTER = '!';

    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");
    private static final Pattern NON_DIGITS = Pattern.compile("[^0-9]");
    private static final Pattern DIGITS_PHONE_INPUT = Pattern.compile("[0-9+\\-]+");

    public List<PartialMatchToken> parse(String rawTerm) {
        if (rawTerm == null || rawTerm.isBlank()) {
            return List.of();
        }

        String collapsed = WHITESPACE.matcher(rawTerm.strip()).replaceAll(" ");
        String normalized = collapsed.substring(0, Math.min(collapsed.length(), MAX_TERM_LENGTH))
                .toLowerCase(Locale.ROOT)
                .strip();
        if (normalized.isEmpty()) {
            return List.of();
        }

        List<PartialMatchToken> tokens = new ArrayList<>();
        for (String word : normalized.split(" ", MAX_TOKENS + 1)) {
            if (tokens.size() == MAX_TOKENS) {
                break;
            }
            tokens.add(createToken(word));
        }
        return List.copyOf(tokens);
    }

    private PartialMatchToken createToken(String word) {
        List<String> patterns = new ArrayList<>(2);
        addPattern(patterns, word);

        String withoutDiacritics = DIACRITICS.matcher(
                Normalizer.normalize(word, Normalizer.Form.NFD)).replaceAll("");
        addPattern(patterns, withoutDiacritics);

        String digitsPattern = null;
        if (DIGITS_PHONE_INPUT.matcher(word).matches()) {
            String digits = NON_DIGITS.matcher(word).replaceAll("");
            if (!digits.isEmpty()) {
                digitsPattern = "%" + digits + "%";
            }
        }
        return new PartialMatchToken(patterns, digitsPattern);
    }

    private void addPattern(List<String> patterns, String value) {
        String escaped = escape(value);
        String pattern = "%" + escaped + "%";
        if (!patterns.contains(pattern)) {
            patterns.add(pattern);
        }
    }

    private String escape(String value) {
        StringBuilder escaped = new StringBuilder(value.length());
        for (char character : value.toCharArray()) {
            if (character == ESCAPE_CHARACTER || character == '%' || character == '_') {
                escaped.append(ESCAPE_CHARACTER);
            }
            escaped.append(character);
        }
        return escaped.toString();
    }
}