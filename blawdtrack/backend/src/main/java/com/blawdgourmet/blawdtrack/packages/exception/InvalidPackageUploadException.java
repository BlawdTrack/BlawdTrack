package com.blawdgourmet.blawdtrack.packages.exception;

/** Indica que la parte multipart requerida no contiene un archivo utilizable. */
public class InvalidPackageUploadException extends RuntimeException {

    public InvalidPackageUploadException(String message) {
        super(message);
    }

    public InvalidPackageUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}
