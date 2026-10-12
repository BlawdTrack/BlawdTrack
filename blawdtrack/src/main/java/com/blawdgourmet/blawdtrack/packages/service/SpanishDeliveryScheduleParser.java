package com.blawdgourmet.blawdtrack.packages.service;

import java.text.Normalizer;
import java.time.LocalTime;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class SpanishDeliveryScheduleParser implements DeliveryScheduleParser {
    private static final String TIME = "(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?";
    private static final Pattern BEFORE = Pattern.compile("antes de (?:las? )?" + TIME);
    private static final Pattern AFTER = Pattern.compile("despues de (?:las? )?" + TIME);
    private static final Pattern RANGE = Pattern.compile(
            "(?:de |entre (?:las? )?)?" + TIME + "\\s*(?:a|y|-)\\s*(?:las? )?" + TIME);
    private static final Map<String, String> HOURS = Map.ofEntries(
            Map.entry("una", "1"), Map.entry("uno", "1"), Map.entry("dos", "2"),
            Map.entry("tres", "3"), Map.entry("cuatro", "4"), Map.entry("cinco", "5"),
            Map.entry("seis", "6"), Map.entry("siete", "7"), Map.entry("ocho", "8"),
            Map.entry("nueve", "9"), Map.entry("diez", "10"), Map.entry("once", "11"),
            Map.entry("doce", "12"));

    @Override
    public Restriction parse(String schedule) {
        String text = normalize(schedule);
        if (text.isEmpty() || text.matches("sin (?:restriccion(?:es)?(?: horaria(?:s)?)?|horario)|cualquier hora")) {
            return new Restriction(Kind.NONE, null, null);
        }
        Matcher matcher = BEFORE.matcher(text);
        if (matcher.matches()) {
            return new Restriction(Kind.BEFORE, null, time(matcher, 1));
        }
        matcher = AFTER.matcher(text);
        if (matcher.matches()) {
            return new Restriction(Kind.AFTER, time(matcher, 1), null);
        }
        matcher = RANGE.matcher(text);
        if (matcher.matches()) {
            return new Restriction(Kind.RANGE, time(matcher, 1), time(matcher, 4));
        }
        throw new IllegalArgumentException("Restricción horaria no reconocida");
    }

    private String normalize(String schedule) {
        if (schedule == null) return "";
        String text = Normalizer.normalize(schedule.toLowerCase(java.util.Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").replace('\u00a0', ' ').strip()
                .replaceAll("a\\.\\s*m\\.?", "am").replaceAll("p\\.\\s*m\\.?", "pm")
                .replaceAll("a\\s+m", "am").replaceAll("p\\s+m", "pm")
                .replaceAll("de la manana", "am").replaceAll("de la tarde|de la noche", "pm")
                .replaceAll("mediodia", "12 pm").replaceAll("\\s+", " ")
                .replaceFirst("^(?:entregar|entrega)\\s+", "");
        for (var entry : HOURS.entrySet()) {
            text = text.replaceAll("\\b" + entry.getKey() + "\\b", entry.getValue());
        }
        return text.strip();
    }

    private LocalTime time(Matcher matcher, int offset) {
        int hour = Integer.parseInt(matcher.group(offset));
        int minute = matcher.group(offset + 1) == null ? 0 : Integer.parseInt(matcher.group(offset + 1));
        String meridiem = matcher.group(offset + 2);
        if (hour > 23 || minute > 59 || (meridiem != null && (hour < 1 || hour > 12))) {
            throw new IllegalArgumentException("Hora inválida en la restricción horaria");
        }
        if (meridiem != null) hour = hour % 12 + (meridiem.equals("pm") ? 12 : 0);
        // Convención diurna de Zoho: "De 10 a 2" significa 10:00–14:00.
        else if (hour >= 1 && hour <= 7) hour += 12;
        return LocalTime.of(hour, minute);
    }
}
