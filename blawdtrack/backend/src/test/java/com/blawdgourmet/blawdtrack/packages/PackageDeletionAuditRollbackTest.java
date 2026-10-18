package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.packages.service.PackageDeletionAuditService;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

/**
 * HU-012 / T03 (#119): si el registro de auditoría falla, el borrado se revierte. El DELETE ya se
 * ejecutó en la base (flush) antes de auditar, así que el paquete solo puede seguir existiendo si la
 * transacción se revirtió. Sin @Transactional en la clase para que el rollback sea el real.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PackageDeletionAuditRollbackTest {

    private static final String SHIPMENT_NUMBER = "ENV-AUD-ROLLBACK";

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private DeliveryPackageRepository packages;

    @MockitoBean private PackageDeletionAuditService deletionAudit;

    private User admin;

    @AfterEach
    void cleanUp() {
        packages.findByShipmentNumber(SHIPMENT_NUMBER).ifPresent(packages::delete);
        if (admin != null) {
            users.delete(admin);
        }
    }

    @Test
    void siFallaLaAuditoriaElPaqueteNoSeElimina() throws Exception {
        admin = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("9-3400-0001")
                .fullName("Administrador de rollback")
                .email("admin-package-audit-rollback@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(RoleName.SALES_ADMIN).orElseThrow())
                .build());
        packages.saveAndFlush(DeliveryPackage.builder()
                .shipmentNumber(SHIPMENT_NUMBER)
                .status(PackageStatus.PENDING)
                .build());
        doThrow(new IllegalStateException("Fallo simulado al guardar la auditoría"))
                .when(deletionAudit).registerDeletion(any(), any(), any());

        mvc.perform(delete("/api/v1/packages/" + SHIPMENT_NUMBER)
                        .header("Authorization", "Bearer " + jwt.generateToken(new UserPrincipal(admin))))
                .andExpect(status().isInternalServerError());

        verify(deletionAudit).registerDeletion(any(), any(), any());
        assertThat(packages.findByShipmentNumber(SHIPMENT_NUMBER)).isPresent();
    }
}
