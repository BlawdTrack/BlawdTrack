package com.blawdgourmet.blawdtrack.audit.exception;

/**
 * Thrown when the credentials are correct but the user's account is in
 * INACTIVE status, so it is not allowed to log in.
 */
public class InactiveAccountException extends RuntimeException {

    public InactiveAccountException(String message) {
        super(message);
    }
}
