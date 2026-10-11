package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

/**
 * HU-012 / T01 (#117): DELETE /api/v1/packages/{numeroEnvio}. La restricción por rol se prueba
 * en PackageRoleRestrictionTest (T02).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PackageDeletionIntegrationTest {

    private static final String URL = "/api/v1/packages/";
    private static final String DELETE_AUDIT = AuditAction.PACKAGE_DELETED.getCode();

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private DeliveryPackageRepository packages;
    @Autowired private AuditLogRepository auditLogs;

    @ParameterizedTest
    @EnumSource(value = PackageStatus.class, names = {"PENDING", "ASSIGNED"})
    void eliminaElPaqueteYRegistraLaAuditoriaConElAdministrador(PackageStatus status) throws Exception {
        User admin = salesAdmin("auditoria-" + status);
        packages.saveAndFlush(paquete("ENV-INT-1", status));

        mvc.perform(delete(URL + "ENV-INT-1").header("Authorization", "Bearer " + token(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Paquete eliminado correctamente."));

        assertThat(packages.findByShipmentNumber("ENV-INT-1")).isEmpty();

        List<AuditLog> registros = auditLogs.findByActionOrderByTimestampDescIdDesc(DELETE_AUDIT);
        assertThat(registros).hasSize(1);
        AuditLog registro = registros.get(0);
        assertThat(registro.getActor().getId()).isEqualTo(admin.getId());
        assertThat(registro.getTimestamp()).isNotNull();
        assertThat(registro.getDetails()).contains("ENV-INT-1").contains(status.getCode());
    }

    @Test
    void aceptaElNumeroDeEnvioEnMinusculas() throws Exception {
        User admin = salesAdmin("minusculas");
        packages.saveAndFlush(paquete("ENV-INT-2", PackageStatus.PENDING));

        mvc.perform(delete(URL + "env-int-2").header("Authorization", "Bearer " + token(admin)))
                .andExpect(status().isOk());

        assertThat(packages.findByShipmentNumber("ENV-INT-2")).isEmpty();
    }

    @Test
    void devuelve404SiElPaqueteNoExiste() throws Exception {
        User admin = salesAdmin("no-existe");

        mvc.perform(delete(URL + "ENV-NO-EXISTE").header("Authorization", "Bearer " + token(admin)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PAQUETE_NO_ENCONTRADO"))
                .andExpect(jsonPath("$.message")
                        .value("No existe un paquete con el número de envío ENV-NO-EXISTE."));

        assertThat(auditLogs.findByActionOrderByTimestampDescIdDesc(DELETE_AUDIT)).isEmpty();
    }

    @ParameterizedTest
    @EnumSource(value = PackageStatus.class, names = {"SHIPPED", "IN_TRANSIT", "NOT_DELIVERED"})
    void devuelve409SiElPaqueteYaFueDespachado(PackageStatus status) throws Exception {
        User admin = salesAdmin("despachado-" + status);
        packages.saveAndFlush(paquete("ENV-INT-3", status));

        mvc.perform(delete(URL + "ENV-INT-3").header("Authorization", "Bearer " + token(admin)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("PAQUETE_DESPACHADO"))
                .andExpect(jsonPath("$.message").value("El paquete ENV-INT-3 ya fue despachado (estado: "
                        + status.getCode() + ") y no puede eliminarse."));

        assertThat(packages.findByShipmentNumber("ENV-INT-3")).isPresent();
        assertThat(auditLogs.findByActionOrderByTimestampDescIdDesc(DELETE_AUDIT)).isEmpty();
    }

    @Test
    void devuelve409SiElPaqueteYaFueEntregado() throws Exception {
        User admin = salesAdmin("entregado");
        packages.saveAndFlush(paquete("ENV-INT-4", PackageStatus.DELIVERED));

        mvc.perform(delete(URL + "ENV-INT-4").header("Authorization", "Bearer " + token(admin)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("PAQUETE_ENTREGADO"))
                .andExpect(jsonPath("$.message")
                        .value("El paquete ENV-INT-4 ya fue entregado y no puede eliminarse."));

        assertThat(packages.findByShipmentNumber("ENV-INT-4")).isPresent();
        assertThat(auditLogs.findByActionOrderByTimestampDescIdDesc(DELETE_AUDIT)).isEmpty();
    }

    private static DeliveryPackage paquete(String shipmentNumber, PackageStatus status) {
        return DeliveryPackage.builder().shipmentNumber(shipmentNumber).status(status).build();
    }

    private User salesAdmin(String suffix) {
        return users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-3200-%04d", Math.abs(suffix.hashCode()) % 10000))
                .fullName("Administrador de ventas de prueba")
                .email("admin-delete-package-" + suffix.toLowerCase() + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(RoleName.SALES_ADMIN).orElseThrow())
                .build());
    }

    private String token(User user) {
        return jwt.generateToken(new UserPrincipal(user));
    }
}
