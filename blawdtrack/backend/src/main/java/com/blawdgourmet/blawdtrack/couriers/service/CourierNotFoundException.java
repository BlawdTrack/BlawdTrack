package com.blawdgourmet.blawdtrack.couriers.service;

/** No existe un mensajero con el id o documento indicado. Se responde 404 {@code COURIER_NOT_FOUND}. */
public class CourierNotFoundException extends RuntimeException {
    public CourierNotFoundException(String message) {
        super(message);
    }
}
