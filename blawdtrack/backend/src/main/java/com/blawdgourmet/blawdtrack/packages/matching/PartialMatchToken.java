package com.blawdgourmet.blawdtrack.packages.matching;

import java.util.List;
import java.util.Objects;

public record PartialMatchToken(List<String> likePatterns, String digitsPattern) {

    public PartialMatchToken {
        likePatterns = List.copyOf(Objects.requireNonNull(likePatterns, "likePatterns"));
    }

    public boolean hasDigitsPattern() {
        return digitsPattern != null;
    }
}