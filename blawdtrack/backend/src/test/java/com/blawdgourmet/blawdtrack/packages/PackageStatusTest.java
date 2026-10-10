package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;

/**
 * HU-012: solo los paquetes Pendiente o Asignado pueden eliminarse (lista blanca).
 */
class PackageStatusTest {

    @Test
    void soloPendienteYAsignadoSonEliminables() {
        List<PackageStatus> eliminables = Arrays.stream(PackageStatus.values())
                .filter(PackageStatus::isDeletable)
                .toList();

        assertThat(eliminables).containsExactlyInAnyOrder(PackageStatus.PENDING, PackageStatus.ASSIGNED);
    }

    @Test
    void losEstadosDespachadosOPosterioresNoSonEliminables() {
        assertThat(PackageStatus.SHIPPED.isDeletable()).isFalse();
        assertThat(PackageStatus.IN_TRANSIT.isDeletable()).isFalse();
        assertThat(PackageStatus.DELIVERED.isDeletable()).isFalse();
        assertThat(PackageStatus.NOT_DELIVERED.isDeletable()).isFalse();
    }

    @Test
    void cadaEstadoTieneSuCodigoEnEspanol() {
        assertThat(PackageStatus.PENDING.getCode()).isEqualTo("PENDIENTE");
        assertThat(PackageStatus.ASSIGNED.getCode()).isEqualTo("ASIGNADO");
        assertThat(PackageStatus.SHIPPED.getCode()).isEqualTo("ENVIADO");
        assertThat(PackageStatus.IN_TRANSIT.getCode()).isEqualTo("EN_TRANSITO");
        assertThat(PackageStatus.DELIVERED.getCode()).isEqualTo("ENTREGADO");
        assertThat(PackageStatus.NOT_DELIVERED.getCode()).isEqualTo("NO_ENTREGADO");
    }
}
