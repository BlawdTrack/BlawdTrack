package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.IllegalTransactionStateException;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
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
 * HU-012 / T03 (#119): registro de auditoría de la eliminación de paquetes. Sin @Transactional en la
 * clase para que cada solicitud confirme (o revierta) su propia transacción, como en producción; los
 * datos se limpian al final de cada prueba.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PackageDeletionAuditIntegrationTest {

    private static final String URL = "/api/v1/packages/";
    private static final String ACTION = AuditAction.PACKAGE_DELETED.getCode();

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private DeliveryPackageRepository packages;
    @Autowired private AuditLogRepository auditLogs;
    @Autowired private PackageDeletionAuditService deletionAudit;

    private final List<User> createdUsers = new ArrayList<>();
    private final List<String> createdPackages = new ArrayList<>();

    @AfterEach
    void cleanUp() {
        List<Long> userIds = createdUsers.stream().map(User::getId).toList();
        auditLogs.deleteAll(auditLogs.findByActionOrderByTimestampDescIdDesc(ACTION).stream()
                .filter(log -> userIds.contains(log.getActor().getId()))
                .toList());
        createdPackages.forEach(number -> packages.findByShipmentNumber(number).ifPresent(packages::delete));
        users.deleteAll(createdUsers);
    }

    @Test
    void eliminacionExitosaGuardaUnRegistroConLosDatosCorrectos() throws Exception {
        User admin = user(RoleName.SALES_ADMIN, "exito");
        paquete("ENV-AUD-1", PackageStatus.ASSIGNED);
        LocalDateTime before = LocalDateTime.now().withNano(0);

        mvc.perform(delete(URL + "ENV-AUD-1").header("Authorization", "Bearer " + token(admin)))
                .andExpect(status().isOk());

        List<AuditLog> registros = registrosDe(admin);
        assertThat(registros).hasSize(1);
        AuditLog registro = registros.get(0);
        assertThat(registro.getActor().getId()).isEqualTo(admin.getId());
        assertThat(registro.getUsuarioAfectado()).isNull();
        assertThat(registro.getDetails()).contains("'ENV-AUD-1'").contains("estado: ASIGNADO");
        assertThat(registro.getTimestamp()).isBetween(before, LocalDateTime.now());
        assertThat(packages.findByShipmentNumber("ENV-AUD-1")).isEmpty();
    }

    @Test
    void noGuardaRegistroSiElPaqueteNoExiste() throws Exception {
        User admin = user(RoleName.SALES_ADMIN, "404");

        mvc.perform(delete(URL + "ENV-AUD-NO-EXISTE").header("Authorization", "Bearer " + token(admin)))
                .andExpect(status().isNotFound());

        assertThat(registrosDe(admin)).isEmpty();
    }

    @ParameterizedTest
    @EnumSource(value = PackageStatus.class, names = {"SHIPPED", "IN_TRANSIT", "DELIVERED", "NOT_DELIVERED"})
    void noGuardaRegistroSiElPaqueteNoEsEliminable(PackageStatus estado) throws Exception {
        User admin = user(RoleName.SALES_ADMIN, "409-" + estado);
        paquete("ENV-AUD-2", estado);

        mvc.perform(delete(URL + "ENV-AUD-2").header("Authorization", "Bearer " + token(admin)))
                .andExpect(status().isConflict());

        assertThat(registrosDe(admin)).isEmpty();
        assertThat(packages.findByShipmentNumber("ENV-AUD-2")).isPresent();
    }

    @Test
    void noGuardaRegistroSiElRolNoTienePermiso() throws Exception {
        User courier = user(RoleName.COURIER, "403");
        paquete("ENV-AUD-3", PackageStatus.PENDING);

        mvc.perform(delete(URL + "ENV-AUD-3").header("Authorization", "Bearer " + token(courier)))
                .andExpect(status().isForbidden());

        assertThat(registrosDe(courier)).isEmpty();
        assertThat(packages.findByShipmentNumber("ENV-AUD-3")).isPresent();
    }

    @Test
    void elRegistroExigeUnaTransaccionActiva() {
        User admin = user(RoleName.SALES_ADMIN, "sin-tx");
        AuthenticatedUser actor = new AuthenticatedUser(admin.getId(), admin.getDocumentType(),
                admin.getDocumentNumber(), admin.getFullName(), RoleName.SALES_ADMIN, admin.getEmail());

        assertThatThrownBy(() -> deletionAudit.registerDeletion(actor, "ENV-AUD-4", PackageStatus.PENDING))
                .isInstanceOf(IllegalTransactionStateException.class);
        assertThat(registrosDe(admin)).isEmpty();
    }

    private List<AuditLog> registrosDe(User actor) {
        return auditLogs.findByActionOrderByTimestampDescIdDesc(ACTION).stream()
                .filter(log -> log.getActor().getId().equals(actor.getId()))
                .toList();
    }

    private void paquete(String shipmentNumber, PackageStatus estado) {
        packages.saveAndFlush(DeliveryPackage.builder().shipmentNumber(shipmentNumber).status(estado).build());
        createdPackages.add(shipmentNumber);
    }

    private User user(String rol, String suffix) {
        long unique = System.nanoTime() % 10_000;
        User user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-3300-%04d", unique))
                .fullName("Actor de auditoria")
                .email("actor-package-audit-" + suffix.toLowerCase() + "-" + unique + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(rol).orElseThrow())
                .build());
        createdUsers.add(user);
        return user;
    }

    private String token(User user) {
        return jwt.generateToken(new UserPrincipal(user));
    }
}
