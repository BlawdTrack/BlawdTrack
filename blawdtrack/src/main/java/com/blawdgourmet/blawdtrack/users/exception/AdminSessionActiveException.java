package com.blawdgourmet.blawdtrack.users.exception;

public class AdminSessionActiveException extends RuntimeException {
    public AdminSessionActiveException(String message) {
        super(message);
    }
}
