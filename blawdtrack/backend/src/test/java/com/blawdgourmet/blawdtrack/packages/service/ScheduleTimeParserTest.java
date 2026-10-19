package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.blawdgourmet.blawdtrack.packages.service.ScheduleTimeParser.ParsedTime;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ScheduleTimeParserTest {

    private static List<LocalTime> timesOf(String text) {
        return ScheduleTimeParser.findAll(ScheduleTimeParser.normalize(text)).stream().map(ParsedTime::toLocalTime).toList();
    }

    @Test
    void normalizaMayusculasYTildes() {
        assertThat(ScheduleTimeParser.normalize("  DESPUÉS de las Tres de la MAÑANA ")).isEqualTo("despues de las tres de la manana");
        assertThat(ScheduleTimeParser.normalize(null)).isEmpty();
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "3                  | 03:00",
            "15                 | 15:00",
            "3:30               | 03:30",
            "15:45              | 15:45",
            "3 p.m.             | 15:00",
            "3 P. M.            | 15:00",
            "3pm                | 15:00",
            "11:15 a.m.         | 11:15",
            "12 p.m.            | 12:00",
            "12 a.m.            | 00:00",
            "15h                | 15:00",
            "15 hrs             | 15:00",
            "3 de la tarde      | 15:00",
            "3 de la noche      | 15:00",
            "9 de la mañana     | 09:00"})
    void leeHorasEnNumeros(String text, String expected) {
        assertThat(timesOf(text)).containsExactly(LocalTime.parse(expected));
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "de las tres                       | 03:00",
            "a las doce                        | 12:00",
            "a la una                          | 01:00",
            "a las dos y media                 | 02:30",
            "a las dos y cuarto                | 02:15",
            "a las cuatro menos cuarto         | 03:45",
            "a las cuatro de la tarde          | 16:00",
            "a las diez de la mañana           | 10:00",
            "hasta el mediodía                 | 12:00",
            "a la medianoche                   | 00:00"})
    void leeHorasEnPalabras(String text, String expected) {
        assertThat(timesOf(text)).containsExactly(LocalTime.parse(expected));
    }

    @Test
    void unaPalabraDeNumeroSueltaNoEsUnaHora() {
        assertThat(timesOf("dejar con dos personas y tres paquetes")).isEmpty();
    }

    @Test
    void ignoraLoQueNoEsUnaHoraValida() {
        assertThat(timesOf("8888-7777")).isEmpty();
        assertThat(timesOf("las 25:00")).isEmpty();
        assertThat(timesOf("las 10:75")).isEmpty();
        assertThat(timesOf("las 13 p.m.")).isEmpty();
    }

    @Test
    void encuentraVariasHorasEnOrden() {
        assertThat(timesOf("De 10 a 2")).containsExactly(LocalTime.of(10, 0), LocalTime.of(2, 0));
        assertThat(timesOf("8:30 a.m. a 4:15 p.m.")).containsExactly(LocalTime.of(8, 30), LocalTime.of(16, 15));
    }

    @Test
    void laLetraAdespuesDeLaHoraNoCuentaComoAmSiLaSigueUnaPalabra() {
        // "3 a mi casa" no es "3 a.m.".
        assertThat(timesOf("3 a mi casa")).containsExactly(LocalTime.of(3, 0));
    }
}
