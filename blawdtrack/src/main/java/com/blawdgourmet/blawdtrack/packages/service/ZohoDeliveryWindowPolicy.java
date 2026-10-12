package com.blawdgourmet.blawdtrack.packages.service;

import java.time.LocalTime;
import org.springframework.stereotype.Component;

/** Aplica las reglas de T300 a una restricción interpretada por un parser. */
@Component
public class ZohoDeliveryWindowPolicy implements DeliveryWindowPolicy {
    private static final LocalTime DEFAULT_START = LocalTime.of(9, 0);
    private static final LocalTime DEFAULT_END = LocalTime.of(16, 0);
    private final DeliveryScheduleParser parser;

    public ZohoDeliveryWindowPolicy(DeliveryScheduleParser parser) {
        this.parser = parser;
    }

    @Override
    public DeliveryWindow calculate(String schedule) {
        var restriction = parser.parse(schedule);
        LocalTime start = DEFAULT_START;
        LocalTime end = DEFAULT_END;
        switch (restriction.kind()) {
            case NONE -> { }
            case BEFORE -> {
                if (restriction.end().isBefore(LocalTime.of(1, 0))) {
                    throw new IllegalArgumentException("Restricción fuera de la jornada de entrega");
                }
                end = restriction.end().minusHours(1);
            }
            case AFTER -> start = restriction.start();
            case RANGE -> {
                start = restriction.start();
                end = restriction.end();
            }
        }
        // Intersección con la jornada operativa; nunca crear rangos nocturnos o invertidos.
        if (start.isBefore(DEFAULT_START)) start = DEFAULT_START;
        if (end.isAfter(DEFAULT_END)) end = DEFAULT_END;
        return new DeliveryWindow(start, end);
    }
}
