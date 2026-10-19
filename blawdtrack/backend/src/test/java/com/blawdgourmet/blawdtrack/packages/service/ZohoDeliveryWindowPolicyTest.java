package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class ZohoDeliveryWindowPolicyTest {

    private static final DeliveryWindow DEFAULT = new DeliveryWindow(LocalTime.of(9, 0), LocalTime.of(16, 0));

    private final DeliveryWindowPolicy policy = new ZohoDeliveryWindowPolicy();

    private static DeliveryWindow window(String start, String end) {
        return new DeliveryWindow(LocalTime.parse(start), LocalTime.parse(end));
    }

    @Test
    void interpretaRangosDeDoceYVeinticuatroHoras() {
        assertThat(policy.calculate("De 10 a 2")).isEqualTo(window("10:00", "14:00"));
        assertThat(policy.calculate("8:30 a.m. a 4:15 p.m.")).isEqualTo(window("08:30", "16:15"));
        assertThat(policy.calculate("08:00-17:00")).isEqualTo(window("08:00", "17:00"));
    }

    @Test
    void interpretaRangosEscritosConPalabras() {
        assertThat(policy.calculate("de diez a dos")).isEqualTo(window("10:00", "14:00"));
        assertThat(policy.calculate("De nueve de la mañana a cuatro de la tarde")).isEqualTo(window("09:00", "16:00"));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "Dejar el paquete en recepción", "Llamar al 8888-7777 antes de entregar", "Casa 25, portón verde"})
    void sinRestriccionAsignaElRangoPorDefecto(String schedule) {
        assertThat(policy.calculate(schedule)).isEqualTo(DEFAULT);
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "Antes de las 3 p.m.             | 09:00 | 14:00",
            "antes de las 15:00              | 09:00 | 14:00",
            "ANTES DE LAS 5 PM               | 09:00 | 16:00",
            "Antes de las 6 p.m.             | 09:00 | 17:00",
            "antes de las 11 a.m.            | 09:00 | 10:00",
            "antes de las 11:30 a. m.        | 09:00 | 10:30",
            "antes de las 17:30              | 09:00 | 16:30",
            "antes del mediodía              | 09:00 | 11:00",
            "antes de las tres de la tarde   | 09:00 | 14:00",
            "antes de las dos y media de la tarde | 09:00 | 13:30",
            "antes de las cuatro menos cuarto de la tarde | 09:00 | 14:45",
            "antes de la una de la tarde     | 09:00 | 12:00",
            "Entregar antes de las 2pm por favor | 09:00 | 13:00"})
    void conRestriccionAntesDeAsignaDeNueveHastaUnaHoraAntesDelLimite(String schedule, String start, String end) {
        assertThat(policy.calculate(schedule)).isEqualTo(window(start, end));
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "Después de las 2 p.m.           | 14:00 | 16:00",
            "despues de las 14:00            | 14:00 | 16:00",
            "después de las 11               | 11:00 | 16:00",
            "A partir de las 10:30 a.m.      | 10:30 | 16:00",
            "después de las diez de la mañana | 10:00 | 16:00",
            "después de la una de la tarde   | 13:00 | 16:00",
            "después de las dos y media de la tarde | 14:30 | 16:00",
            "después del mediodía            | 12:00 | 16:00",
            "Pasar después de las 8 a.m.     | 08:00 | 16:00"})
    void conRestriccionDespuesDeAsignaDesdeEsaHoraHastaLasCuatroDeLaTarde(String schedule, String start, String end) {
        assertThat(policy.calculate(schedule)).isEqualTo(window(start, end));
    }

    @Test
    void conAmbasRestriccionesDespuesDeMarcaElInicioYAntesDeElFinalMenosUnaHora() {
        assertThat(policy.calculate("después de las 10 a.m. y antes de las 3 p.m.")).isEqualTo(window("10:00", "14:00"));
        assertThat(policy.calculate("antes de las 3 p.m. y después de las 11 a.m.")).isEqualTo(window("11:00", "14:00"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "antes de las 10 a.m.",
            "antes de las 3",
            "antes de las 9:30",
            "después de las 4 p.m.",
            "después de las 5 p.m.",
            "después de las 22:00",
            "después de las 5 p.m. y antes de las 8 a.m."})
    void siLaRestriccionDejaUnRangoImposibleUsaElRangoPorDefecto(String schedule) {
        assertThat(policy.calculate(schedule)).isEqualTo(DEFAULT);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "antes de", "antes de las", "antes de las ", "después de", "después de las 99", "antes de las 25:00",
            "antes de las 12:75", "después de las 0 p.m.", "antes de que llegue el cliente", "a partir de mañana",
            "antes de las tres y", "###", "antes de las 10 a.m", "ñandú á é í ó ú ü"})
    void unTextoQueNoSeEntiendeNuncaFallaYUsaElRangoPorDefecto(String schedule) {
        assertThatCode(() -> policy.calculate(schedule)).doesNotThrowAnyException();
        assertThat(policy.calculate(schedule)).isEqualTo(DEFAULT);
    }

    @Test
    void unTextoMuyLargoNoFalla() {
        String longText = "texto ".repeat(5_000) + "después de las 2 p.m.";

        assertThat(policy.calculate(longText)).isEqualTo(window("14:00", "16:00"));
    }

    @Test
    void siempreDevuelveUnRangoConInicioAnteriorAlFin() {
        for (String schedule : new String[] {"antes de las 00:30", "antes de las 1 a.m.", "antes de las 23:59", "después de las 23:59",
                "antes de las 0:00", "después de las 12 a.m.", "antes de las 12 p.m."}) {
            DeliveryWindow result = policy.calculate(schedule);
            assertThat(result.start()).isBefore(result.end());
        }
    }
}
