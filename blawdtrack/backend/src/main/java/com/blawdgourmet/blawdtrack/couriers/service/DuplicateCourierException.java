package com.blawdgourmet.blawdtrack.couriers.service;

/**
 * El documento, el correo o el teléfono ya pertenecen a otro usuario. Se responde 409
 * {@code COURIER_CONFLICT} con un mensaje que indica cuál de los tres es.
 */
public class DuplicateCourierException extends RuntimeException {
    public DuplicateCourierException(String message) {
        super(message);
    }
}
