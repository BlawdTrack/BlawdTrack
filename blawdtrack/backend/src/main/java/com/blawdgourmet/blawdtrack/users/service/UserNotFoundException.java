package com.blawdgourmet.blawdtrack.users.service;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
