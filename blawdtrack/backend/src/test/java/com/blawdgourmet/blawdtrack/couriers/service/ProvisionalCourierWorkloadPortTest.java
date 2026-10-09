package com.blawdgourmet.blawdtrack.couriers.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class ProvisionalCourierWorkloadPortTest {
    private final ProvisionalCourierWorkloadPort port = new ProvisionalCourierWorkloadPort();

    @Test
    void respondeSinAsignacionesActivasParaCualquierMensajero() {
        assertThat(port.hasActiveAssignments(1L)).isFalse();
        assertThat(port.hasActiveAssignments(999L)).isFalse();
    }
}
