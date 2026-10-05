package com.blawdgourmet.blawdtrack.packages.search;

public record PackageSearchTerm(String likePattern, String digitsPattern) {

    public boolean hasDigitsPattern() {
        return digitsPattern != null;
    }
}