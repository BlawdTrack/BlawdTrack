package com.blawdgourmet.blawdtrack.packages.service;

import java.text.Normalizer;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lee las horas que aparecen en el horario en texto libre de un paquete (Zoho), tanto en números ("3", "3:30",
 * "15:00", "3 p.m.", "15h") como en palabras ("las tres", "las dos y media", "la una", "mediodía", "tres de la
 * tarde"). Es defensivo: nunca lanza excepciones; lo que no entiende, lo ignora.
 *
 * <p>Una hora sin a.m./p.m. ni "de la mañana/tarde/noche" se lee tal cual, en formato de 24 horas.
 */
final class ScheduleTimeParser {

    /** Parte del día que dice el texto junto a la hora; {@code NONE} si no dice nada (se lee en 24 horas). */
    enum Meridiem { AM, PM, NONE }

    /** Una hora encontrada: dónde termina en el texto y cómo se escribió. */
    record ParsedTime(int hour, int minute, Meridiem meridiem, int end) {

        /** La hora como {@link LocalTime}: con a.m./p.m. en 12 horas; sin ellos, tal cual. */
        LocalTime toLocalTime() {
            int resolved = switch (meridiem) {
                case AM -> hour % 12;
                case PM -> hour % 12 + 12;
                case NONE -> hour;
            };
            return LocalTime.of(resolved, minute);
        }
    }

    private static final Map<String, Integer> WORD_HOURS = Map.ofEntries(
            Map.entry("una", 1), Map.entry("dos", 2), Map.entry("tres", 3), Map.entry("cuatro", 4),
            Map.entry("cinco", 5), Map.entry("seis", 6), Map.entry("siete", 7), Map.entry("ocho", 8),
            Map.entry("nueve", 9), Map.entry("diez", 10), Map.entry("once", 11), Map.entry("doce", 12),
            Map.entry("mediodia", 12), Map.entry("medianoche", 0));

    private static final String PERIOD =
            "(?:\\s*(?:([ap])\\.?\\s*m\\.?(?![a-z])|de\\s+la\\s+(manana|tarde|noche|madrugada)))?";

    private static final Pattern NUMERIC = Pattern.compile(
            "(\\d{1,2})(?::(\\d{2}))?(?:\\s*h(?:rs?)?\\.?(?![a-z]))?" + PERIOD);

    private static final Pattern WORD = Pattern.compile(
            "(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|mediodia|medianoche)(?![a-z])"
                    + "(?:\\s+(y\\s+media|y\\s+cuarto|menos\\s+cuarto))?" + PERIOD);

    /** Palabras que, delante de una hora escrita en palabras, indican que de verdad es una hora y no otra palabra. */
    private static final Pattern WORD_CONTEXT = Pattern.compile("(?:^|[\\s-])(?:las?|del?|a|hasta|desde|el)\\s+$");

    private ScheduleTimeParser() {
    }

    /** Pasa a minúsculas y quita las tildes ("después" → "despues", "mañana" → "manana"). */
    static String normalize(String text) {
        if (text == null) {
            return "";
        }
        String decomposed = Normalizer.normalize(text.toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        return decomposed.replaceAll("\\p{M}+", "").strip();
    }

    /** Todas las horas del texto ya normalizado, de izquierda a derecha, sin solaparse. */
    static List<ParsedTime> findAll(String text) {
        List<ParsedTime> found = new ArrayList<>();
        int index = 0;
        while (index < text.length()) {
            Optional<ParsedTime> time = parseAt(text, index, isWordContext(text, index));
            if (time.isPresent()) {
                found.add(time.get());
                index = Math.max(time.get().end(), index + 1);
            } else {
                index++;
            }
        }
        return found;
    }

    /**
     * La hora que empieza exactamente en {@code from} (sin contar los espacios y artículos iniciales), o vacío.
     * Se usa justo después de "antes de" o "después de", donde una hora en palabras ya está en contexto.
     */
    static Optional<ParsedTime> parseAfterKeyword(String text, int from) {
        int start = skipArticle(text, from);
        return parseAt(text, start, true);
    }

    private static int skipArticle(String text, int from) {
        Matcher matcher = Pattern.compile("\\s*(?:(?:las?|el)\\s+)?").matcher(text);
        matcher.region(from, text.length());
        return matcher.lookingAt() ? matcher.end() : from;
    }

    private static boolean isWordContext(String text, int index) {
        return WORD_CONTEXT.matcher(text.substring(0, index)).find();
    }

    private static Optional<ParsedTime> parseAt(String text, int from, boolean allowWords) {
        if (from >= text.length() || continuesAnotherNumber(text, from)) {
            return Optional.empty();
        }
        Optional<ParsedTime> numeric = parseNumeric(text, from);
        if (numeric.isPresent() || !allowWords) {
            return numeric;
        }
        return parseWord(text, from);
    }

    /** {@code true} si lo que hay antes es parte de otro número ("2" dentro de "25") o sus minutos (":00" de "25:00"). */
    private static boolean continuesAnotherNumber(String text, int from) {
        if (from == 0) {
            return false;
        }
        char previous = text.charAt(from - 1);
        return Character.isDigit(previous) || previous == ':';
    }

    private static Optional<ParsedTime> parseNumeric(String text, int from) {
        Matcher matcher = NUMERIC.matcher(text);
        matcher.region(from, text.length());
        if (!matcher.lookingAt()) {
            return Optional.empty();
        }
        int hour = Integer.parseInt(matcher.group(1));
        int minute = matcher.group(2) == null ? 0 : Integer.parseInt(matcher.group(2));
        return build(hour, minute, meridiemOf(matcher.group(3), matcher.group(4)), matcher.end());
    }

    private static Optional<ParsedTime> parseWord(String text, int from) {
        Matcher matcher = WORD.matcher(text);
        matcher.region(from, text.length());
        if (!matcher.lookingAt()) {
            return Optional.empty();
        }
        int hour = WORD_HOURS.get(matcher.group(1));
        int minute = 0;
        String suffix = matcher.group(2);
        if (suffix != null && suffix.startsWith("menos")) {
            hour = Math.floorMod(hour - 1, 24);
            minute = 45;
        } else if (suffix != null) {
            minute = suffix.endsWith("media") ? 30 : 15;
        }
        return build(hour, minute, meridiemOf(matcher.group(3), matcher.group(4)), matcher.end());
    }

    private static Meridiem meridiemOf(String letter, String dayPart) {
        if (letter != null) {
            return "p".equals(letter) ? Meridiem.PM : Meridiem.AM;
        }
        if (dayPart == null) {
            return Meridiem.NONE;
        }
        return "tarde".equals(dayPart) || "noche".equals(dayPart) ? Meridiem.PM : Meridiem.AM;
    }

    /** Solo acepta horas y minutos válidos; con a.m./p.m. la hora debe estar entre 1 y 12. */
    private static Optional<ParsedTime> build(int hour, int minute, Meridiem meridiem, int end) {
        boolean validHour = hour <= 23 && (meridiem == Meridiem.NONE || hour >= 1 && hour <= 12);
        if (minute > 59 || !validHour) {
            return Optional.empty();
        }
        return Optional.of(new ParsedTime(hour, minute, meridiem, end));
    }
}
