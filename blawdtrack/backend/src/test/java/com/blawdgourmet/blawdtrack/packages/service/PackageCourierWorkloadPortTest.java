package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import java.util.Collection;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PackageCourierWorkloadPortTest {

    @Mock private DeliveryPackageRepository packages;
    @InjectMocks private PackageCourierWorkloadPort port;

    @Test
    void consultaPorElMensajeroExcluyendoLosEstadosTerminados() {
        when(packages.existsByAssignedCourierIdAndStatusNotIn(eq(7L), any())).thenReturn(true);

        assertThat(port.hasActiveAssignments(7L)).isTrue();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Collection<PackageStatus>> excluded = ArgumentCaptor.forClass(Collection.class);
        verify(packages).existsByAssignedCourierIdAndStatusNotIn(eq(7L), excluded.capture());
        assertThat(excluded.getValue()).containsExactlyInAnyOrderElementsOf(
                Set.of(PackageStatus.DELIVERED, PackageStatus.NOT_DELIVERED));
    }

    @Test
    void sinPaquetesActivosRespondeFalso() {
        when(packages.existsByAssignedCourierIdAndStatusNotIn(eq(8L), any())).thenReturn(false);

        assertThat(port.hasActiveAssignments(8L)).isFalse();
    }
}
