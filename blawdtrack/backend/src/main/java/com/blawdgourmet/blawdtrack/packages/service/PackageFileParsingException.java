package com.blawdgourmet.blawdtrack.packages.service;

public class PackageFileParsingException extends RuntimeException {

    public PackageFileParsingException(String message) {
        super(message);
    }

    public PackageFileParsingException(String message, Throwable cause) {
        super(message, cause);
    }
}
