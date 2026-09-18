package com.blawdgourmet.blawdtrack.audit.exception;

/**
 * Thrown when the email does not exist or the password does not match.
 * The message must always be generic, without indicating which of the two
 * fields is incorrect, as defined in HU-001.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
