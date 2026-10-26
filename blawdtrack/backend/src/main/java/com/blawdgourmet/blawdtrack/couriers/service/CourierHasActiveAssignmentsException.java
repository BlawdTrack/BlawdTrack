package com.blawdgourmet.blawdtrack.couriers.service;

/** El mensajero tiene asignaciones activas y por eso no puede desactivarse (HU-005). */
public class CourierHasActiveAssignmentsException extends RuntimeException {
    public CourierHasActiveAssignmentsException(String message) {
        super(message);
    }
}
