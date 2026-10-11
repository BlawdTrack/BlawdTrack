package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.dto.PackageDeletionResponse;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;

@ExtendWith(MockitoExtension.class)
class PackageDeletionServiceImplTest {

    private static final AuthenticatedUser ACTOR = new AuthenticatedUser(
            7L, DocumentType.CEDULA, "1-1111-1111", "Ana Ventas", "ADMIN_VENTAS", "ana@example.test");

    @Mock private DeliveryPackageRepository packages;
    @Mock private AuditService auditService;

    private PackageDeletionService service() {
        return new PackageDeletionServiceImpl(packages, auditService);
    }

    @ParameterizedTest
    @EnumSource(value = PackageStatus.class, names = {"PENDING", "ASSIGNED"})
    void eliminaElPaqueteEnEstadoEliminableYRegistraLaAuditoriaAntes(PackageStatus status) {
        DeliveryPackage pkg = paquete("ENV-001", status);
        when(packages.findByShipmentNumber("ENV-001")).thenReturn(Optional.of(pkg));

        PackageDeletionResponse response = service().deletePackage("ENV-001", ACTOR);

        assertThat(response.message()).isEqualTo("Paquete eliminado correctamente.");
        InOrder order = inOrder(auditService, packages);
        order.verify(auditService).registrarEliminacionPaquete(ACTOR, "ENV-001", status);
        order.verify(packages).delete(pkg);
    }

    @Test
    void normalizaElNumeroDeEnvioAntesDeBuscar() {
        DeliveryPackage pkg = paquete("ENV-002", PackageStatus.PENDING);
        when(packages.findByShipmentNumber("ENV-002")).thenReturn(Optional.of(pkg));

        service().deletePackage("  env-002 ", ACTOR);

        verify(packages).findByShipmentNumber("ENV-002");
        verify(auditService).registrarEliminacionPaquete(ACTOR, "ENV-002", PackageStatus.PENDING);
    }

    @Test
    void lanzaNoEncontradoSiNoExisteElNumeroDeEnvio() {
        when(packages.findByShipmentNumber("ENV-999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().deletePackage("ENV-999", ACTOR))
                .isInstanceOf(PackageNotFoundException.class)
                .hasMessage("No existe un paquete con el número de envío ENV-999.");

        verifyNoInteractions(auditService);
        verify(packages, never()).delete(any());
    }

    @ParameterizedTest
    @EnumSource(value = PackageStatus.class, names = {"SHIPPED", "IN_TRANSIT", "NOT_DELIVERED"})
    void lanzaDespachadoSiElPaqueteYaSalio(PackageStatus status) {
        when(packages.findByShipmentNumber("ENV-003")).thenReturn(Optional.of(paquete("ENV-003", status)));

        assertThatThrownBy(() -> service().deletePackage("ENV-003", ACTOR))
                .isInstanceOf(PackageDispatchedException.class)
                .hasMessage("El paquete ENV-003 ya fue despachado (estado: " + status.getCode()
                        + ") y no puede eliminarse.");

        verifyNoInteractions(auditService);
        verify(packages, never()).delete(any());
    }

    @Test
    void lanzaEntregadoSiElPaqueteYaFueEntregado() {
        when(packages.findByShipmentNumber("ENV-004"))
                .thenReturn(Optional.of(paquete("ENV-004", PackageStatus.DELIVERED)));

        assertThatThrownBy(() -> service().deletePackage("ENV-004", ACTOR))
                .isInstanceOf(PackageDeliveredException.class)
                .hasMessage("El paquete ENV-004 ya fue entregado y no puede eliminarse.");

        verifyNoInteractions(auditService);
        verify(packages, never()).delete(any());
    }

    private static DeliveryPackage paquete(String shipmentNumber, PackageStatus status) {
        return DeliveryPackage.builder().id(1L).shipmentNumber(shipmentNumber).status(status).build();
    }
}
