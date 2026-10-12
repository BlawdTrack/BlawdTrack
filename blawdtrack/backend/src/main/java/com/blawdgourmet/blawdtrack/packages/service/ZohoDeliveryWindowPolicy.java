package com.blawdgourmet.blawdtrack.packages.service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Interpreta los rangos usuales de Zoho (por ejemplo, "De 10 a 2",
 * "9:00 a.m. a 4:00 p.m." o "08:00-17:00"). Cuando la nota no contiene
 * un rango reconocible se utiliza el horario operativo predeterminado.
 */
@Component
public class ZohoDeliveryWindowPolicy implements DeliveryWindowPolicy {

    static final LocalTime DEFAULT_START = LocalTime.of(9, 0);
    static final LocalTime DEFAULT_END = LocalTime.of(16, 0);

    private static final Pattern TIME_PATTERN = Pattern.compile(
            "(?<!\\d)(\\d{1,2})(?::(\\d{2}))?\\s*(a\\.?\\s*m\\.?|p\\.?\\s*m\\.?)?",
            Pattern.CASE_INSENSITIVE);

    @Override
    public DeliveryWindow calculate(String schedule) {
        List<TimeToken> times = extractTimes(schedule);
        if (times.size() < 2) {
            return defaultWindow();
        }

        LocalTime start = times.get(0).toLocalTime(false);
        LocalTime end = times.get(1).toLocalTime(true);
        if (!end.isAfter(start) && times.get(1).meridiem() == null
                && times.get(1).hour() <= 12) {
            end = end.plusHours(12);
        }

        return end.isAfter(start) ? new DeliveryWindow(start, end) : defaultWindow();
    }

    private List<TimeToken> extractTimes(String schedule) {
        if (schedule == null || schedule.isBlank()) {
            return List.of();
        }
        Matcher matcher = TIME_PATTERN.matcher(schedule.toLowerCase(Locale.ROOT));
        List<TimeToken> result = new ArrayList<>(2);
        while (matcher.find() && result.size() < 2) {
            int hour = Integer.parseInt(matcher.group(1));
            int minute = matcher.group(2) == null ? 0 : Integer.parseInt(matcher.group(2));
            String meridiem = matcher.group(3);
            if (hour <= 23 && minute <= 59 && (meridiem == null || hour <= 12)) {
                result.add(new TimeToken(hour, minute, meridiem));
            }
        }
        return result;
    }

    private DeliveryWindow defaultWindow() {
        return new DeliveryWindow(DEFAULT_START, DEFAULT_END);
    }

    private record TimeToken(int hour, int minute, String meridiem) {
        LocalTime toLocalTime(boolean endOfRange) {
            int resolvedHour = hour;
            if (meridiem != null) {
                boolean afternoon = meridiem.replace(".", "").replace(" ", "")
                        .equalsIgnoreCase("pm");
                resolvedHour = hour % 12 + (afternoon ? 12 : 0);
            } else if (endOfRange && hour == 12) {
                resolvedHour = 12;
            }
            return LocalTime.of(resolvedHour, minute);
        }
    }
}
