package com.blawdgourmet.blawdtrack.users.service;

public class AdminNotFoundException extends RuntimeException {
    public AdminNotFoundException(String message) {
        super(message);
    }
}
