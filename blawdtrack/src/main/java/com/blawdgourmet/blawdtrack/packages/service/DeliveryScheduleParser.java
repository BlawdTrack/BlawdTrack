package com.blawdgourmet.blawdtrack.packages.service;

import java.time.LocalTime;

/** Interpreta texto sin aplicar las reglas operativas de entrega. */
public interface DeliveryScheduleParser {
    Restriction parse(String schedule);

    enum Kind { NONE, BEFORE, AFTER, RANGE }

    record Restriction(Kind kind, LocalTime start, LocalTime end) { }
}
