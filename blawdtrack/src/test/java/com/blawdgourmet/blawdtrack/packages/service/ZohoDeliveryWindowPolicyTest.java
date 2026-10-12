package com.blawdgourmet.blawdtrack.packages.service;

import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ZohoDeliveryWindowPolicyTest {
    private final DeliveryWindowPolicy policy = new ZohoDeliveryWindowPolicy(new SpanishDeliveryScheduleParser());

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "Sin restricción", "sin restricciones horarias", "Cualquier hora"})
    void usaJornadaPredeterminadaSinRestriccion(String schedule) {
        assertThat(policy.calculate(schedule)).isEqualTo(window("09:00", "16:00"));
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "antes de las 12 |09:00|11:00",
            "Antes de las tres de la tarde|09:00|14:00",
            "antes de las 14:30|09:00|13:30",
            "antes de las 4 p.m.|09:00|15:00",
            "antes de mediodía|09:00|11:00",
            "después de las 11|11:00|16:00",
            "DESPUÉS DE LA UNA|13:00|16:00",
            "despues de las 2:30 pm|14:30|16:00",
            "después de las nueve de la mañana|09:00|16:00",
            "De 10 a 2|10:00|14:00",
            "9 am a 12 pm|09:00|12:00",
            "12 pm a 3 pm|12:00|15:00",
            "Entre las once y la una|11:00|13:00",
            "Entregar entre las 11 y la 1|11:00|13:00",
            "09:30-15:45|09:30|15:45",
            "9:00 a. m. a 4:00 p. m.|09:00|16:00",
            "3 pm a 6 pm|15:00|16:00",
            "08:00-17:00|09:00|16:00"
    })
    void calculaReglasYFormatosDeZoho(String schedule, String start, String end) {
        assertThat(policy.calculate(schedule)).isEqualTo(window(start, end));
    }

    @ParameterizedTest
    @ValueSource(strings = {"antes de las 10", "antes de las nueve", "antes de las 00:30",
            "después de las 16", "después de las cinco", "16:00-09:00", "6 pm a 9 pm",
            "antes de las 25", "después de las 12:60", "antes de las 0 am", "antes de las 13 pm",
            "pedido 12 entregar 3", "antes de las 12 o después de las 2", "antes de las 12:5",
            "antes de las 123", "mañana", "6 pm a 9 pm - solo miércoles y viernes"})
    void rechazaTextoInvalidoAmbiguoORangoSinDisponibilidad(String schedule) {
        assertThatThrownBy(() -> policy.calculate(schedule)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void dependeDelContratoDelParser() {
        DeliveryScheduleParser parser = mock(DeliveryScheduleParser.class);
        when(parser.parse("preferencia externa")).thenReturn(new DeliveryScheduleParser.Restriction(
                DeliveryScheduleParser.Kind.BEFORE, null, LocalTime.of(13, 0)));
        assertThat(new ZohoDeliveryWindowPolicy(parser).calculate("preferencia externa"))
                .isEqualTo(window("09:00", "12:00"));
        verify(parser).parse("preferencia externa");
    }

    @Test
    void resultadoNoPermiteValoresNulosNiRangosInvertidos() {
        assertThatThrownBy(() -> new DeliveryWindow(null, LocalTime.NOON)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> window("16:00", "09:00")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> window("09:00", "09:00")).isInstanceOf(IllegalArgumentException.class);
    }

    private DeliveryWindow window(String start, String end) {
        return new DeliveryWindow(LocalTime.parse(start), LocalTime.parse(end));
    }
}
