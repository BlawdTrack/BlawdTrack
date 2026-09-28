package com.blawdgourmet.blawdtrack.couriers.service;

public class DuplicateCourierException extends RuntimeException {
    public DuplicateCourierException(String message) {
        super(message);
    }
}
