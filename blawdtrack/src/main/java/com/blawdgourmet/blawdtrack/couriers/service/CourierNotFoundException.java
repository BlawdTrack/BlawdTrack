package com.blawdgourmet.blawdtrack.couriers.service;

public class CourierNotFoundException extends RuntimeException {
    public CourierNotFoundException(String message) {
        super(message);
    }
}
