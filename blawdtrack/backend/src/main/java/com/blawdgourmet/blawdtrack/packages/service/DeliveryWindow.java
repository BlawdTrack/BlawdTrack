package com.blawdgourmet.blawdtrack.packages.service;

import java.time.LocalTime;

/** Rango horario calculado para realizar una entrega. */
public record DeliveryWindow(LocalTime start, LocalTime end) {

    public DeliveryWindow {
        if (start == null || end == null || !start.isBefore(end)) {
            throw new IllegalArgumentException("El rango de entrega debe tener una hora inicial anterior a la final");
        }
    }
}
