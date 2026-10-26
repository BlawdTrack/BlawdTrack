package com.blawdgourmet.blawdtrack.couriers.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CourierDeactivationValidatorTest {
    private final CourierWorkloadPort workload = mock(CourierWorkloadPort.class);
    private final CourierDeactivationValidator validator = new CourierDeactivationValidator(workload);

    @Test
    void lanzaExcepcionCuandoElMensajeroTieneAsignacionesActivas() {
        when(workload.hasActiveAssignments(7L)).thenReturn(true);

        assertThatThrownBy(() -> validator.validateCanDeactivate(7L))
                .isInstanceOf(CourierHasActiveAssignmentsException.class)
                .hasMessage("El mensajero tiene paquetes o entregas pendientes y no puede desactivarse");
    }

    @Test
    void noLanzaExcepcionCuandoElMensajeroNoTieneAsignacionesActivas() {
        when(workload.hasActiveAssignments(7L)).thenReturn(false);

        assertThatCode(() -> validator.validateCanDeactivate(7L)).doesNotThrowAnyException();
    }

    @Test
    void consultaAlPuertoConElMismoIdRecibido() {
        when(workload.hasActiveAssignments(42L)).thenReturn(false);

        validator.validateCanDeactivate(42L);

        verify(workload).hasActiveAssignments(42L);
    }
}
