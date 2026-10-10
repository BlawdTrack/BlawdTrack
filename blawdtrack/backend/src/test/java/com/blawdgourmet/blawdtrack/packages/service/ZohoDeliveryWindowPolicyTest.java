package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalTime;
import org.junit.jupiter.api.Test;

class ZohoDeliveryWindowPolicyTest {

    private final DeliveryWindowPolicy policy = new ZohoDeliveryWindowPolicy();

    @Test
    void interpretaRangosDeDoceYVeinticuatroHoras() {
        assertThat(policy.calculate("De 10 a 2"))
                .isEqualTo(new DeliveryWindow(LocalTime.of(10, 0), LocalTime.of(14, 0)));
        assertThat(policy.calculate("8:30 a.m. a 4:15 p.m."))
                .isEqualTo(new DeliveryWindow(LocalTime.of(8, 30), LocalTime.of(16, 15)));
        assertThat(policy.calculate("08:00-17:00"))
                .isEqualTo(new DeliveryWindow(LocalTime.of(8, 0), LocalTime.of(17, 0)));
    }

    @Test
    void usaHorarioOperativoCuandoLaNotaNoContieneUnRangoValido() {
        DeliveryWindow expected = new DeliveryWindow(LocalTime.of(9, 0), LocalTime.of(16, 0));

        assertThat(policy.calculate(null)).isEqualTo(expected);
        assertThat(policy.calculate("Dejar el paquete en recepción")).isEqualTo(expected);
    }
}
