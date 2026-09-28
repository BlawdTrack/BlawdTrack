package com.blawdgourmet.blawdtrack.couriers.service;

public class CourierHasActiveAssignmentsException extends RuntimeException {
    public CourierHasActiveAssignmentsException(String message) {
        super(message);
    }
}
