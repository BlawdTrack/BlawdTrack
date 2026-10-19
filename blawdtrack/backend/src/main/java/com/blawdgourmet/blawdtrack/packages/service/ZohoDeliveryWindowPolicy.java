package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.service.ScheduleTimeParser.ParsedTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Calcula el rango de entrega de un paquete a partir de su horario en texto libre (HU-010 / Task 300), con las reglas
 * de la empresa:
 *
 * <ul>
 *   <li>Sin restricción (vacío o sin una hora que se entienda): de 9:00 a.m. a 4:00 p.m.</li>
 *   <li>"Antes de las X": de 9:00 a.m. a una hora antes del límite indicado.</li>
 *   <li>"Después de las X" (o "a partir de las X"): desde esa hora hasta las 4:00 p.m.</li>
 *   <li>Si dice las dos cosas, "después de" marca el inicio y "antes de" el final menos una hora.</li>
 *   <li>Un rango explícito ("De 10 a 2", "9:00 a.m. a 4:00 p.m.", "08:00-17:00") se respeta tal cual.</li>
 * </ul>
 *
 * <p>Las horas pueden venir en números o en palabras (ver {@link ScheduleTimeParser}); sin a.m./p.m. se leen en 24 horas.
 * Si la restricción deja un rango imposible (por ejemplo "antes de las 10 a.m.", que daría 9:00 a 9:00), se usa el rango
 * por defecto.
 */
@Component
public class ZohoDeliveryWindowPolicy implements DeliveryWindowPolicy {

    static final LocalTime DEFAULT_START = LocalTime.of(9, 0);
    static final LocalTime DEFAULT_END = LocalTime.of(16, 0);

    private static final int ONE_HOUR_IN_SECONDS = 3600;

    private static final Pattern BEFORE = Pattern.compile("antes\\s+d(?:e|el)(?=\\s|\\d)");
    private static final Pattern AFTER = Pattern.compile("(?:despues\\s+d(?:e|el)|a\\s+partir\\s+d(?:e|el))(?=\\s|\\d)");

    @Override
    public DeliveryWindow calculate(String schedule) {
        String text = ScheduleTimeParser.normalize(schedule);
        if (text.isEmpty()) {
            return defaultWindow();
        }
        return restrictionWindow(text)
                .or(() -> explicitRange(text))
                .orElseGet(this::defaultWindow);
    }

    /** El rango de una restricción "antes de" / "después de", si el texto trae alguna con una hora que se entienda. */
    private Optional<DeliveryWindow> restrictionWindow(String text) {
        Optional<LocalTime> before = limitAfter(BEFORE, text);
        Optional<LocalTime> after = limitAfter(AFTER, text);
        if (before.isEmpty() && after.isEmpty()) {
            return Optional.empty();
        }
        LocalTime start = after.orElse(DEFAULT_START);
        LocalTime end = before.map(this::oneHourBefore).orElse(DEFAULT_END);
        return Optional.of(validOrDefault(start, end));
    }

    /** La hora que sigue a la primera aparición de la palabra clave (con o sin "las"/"la"/"el" en medio). */
    private Optional<LocalTime> limitAfter(Pattern keyword, String text) {
        Matcher matcher = keyword.matcher(text);
        while (matcher.find()) {
            Optional<ParsedTime> time = ScheduleTimeParser.parseAfterKeyword(text, matcher.end());
            if (time.isPresent()) {
                return time.map(ParsedTime::toLocalTime);
            }
        }
        return Optional.empty();
    }

    /** Una hora antes del límite; si el límite es antes de la 1:00 a.m. no hay "una hora antes" del mismo día. */
    private LocalTime oneHourBefore(LocalTime limit) {
        int seconds = limit.toSecondOfDay() - ONE_HOUR_IN_SECONDS;
        return seconds < 0 ? LocalTime.MIN : LocalTime.ofSecondOfDay(seconds);
    }

    private DeliveryWindow validOrDefault(LocalTime start, LocalTime end) {
        return start.isBefore(end) ? new DeliveryWindow(start, end) : defaultWindow();
    }

    /** Un rango escrito con dos horas ("De 10 a 2", "8:30 a.m. a 4:15 p.m.", "08:00-17:00"). */
    private Optional<DeliveryWindow> explicitRange(String text) {
        List<ParsedTime> times = ScheduleTimeParser.findAll(text);
        if (times.size() < 2) {
            return Optional.empty();
        }
        ParsedTime first = times.get(0);
        ParsedTime second = times.get(1);
        LocalTime start = first.toLocalTime();
        LocalTime end = second.toLocalTime();
        if (!end.isAfter(start) && second.meridiem() == ScheduleTimeParser.Meridiem.NONE && second.hour() <= 12) {
            end = end.plusHours(12);
        }
        return end.isAfter(start) ? Optional.of(new DeliveryWindow(start, end)) : Optional.empty();
    }

    private DeliveryWindow defaultWindow() {
        return new DeliveryWindow(DEFAULT_START, DEFAULT_END);
    }
}
