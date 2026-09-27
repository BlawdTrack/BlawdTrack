package com.blawdgourmet.blawdtrack.audit;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class AuditServiceTest {

    @Autowired private AuditService audit;
    @Autowired private AuditLogRepository auditLogs;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private EntityManager entityManager;

    private User persistedUser(String documentNumber, String email, String phone, String role) {
        return users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber(documentNumber)
                .fullName("Usuario " + documentNumber).email(email).phone(phone)
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow()).build());
    }

    private static AuthenticatedUser authenticated(User user) {
        return new AuthenticatedUser(user.getId(), user.getDocumentType(), user.getDocumentNumber(), user.getFullName(),
                user.getRole().getName(), user.getEmail());
    }

    private List<AuditLog> recordsAffecting(Long affectedId) {
        entityManager.flush();
        entityManager.clear();
        return auditLogs.findAll().stream()
                .filter(log -> log.getUsuarioAfectado() != null
                        && affectedId.equals(log.getUsuarioAfectado().getId()))
                .toList();
    }

    @Test
    void logActionPersisteActorAfectadoAccionDetalleYFecha() {
        var actorUser = persistedUser("AUDITACTOR76", "auditactor76@example.com",
                "76000001", "SUPER_USUARIO");
        var affected = persistedUser("AUDITAFECTADO76", "auditafectado76@example.com",
                "76000002", "MENSAJERO");

        LocalDateTime before = LocalDateTime.now();
        audit.logAction(AuditAction.COURIER_UPDATED, authenticated(actorUser), affected, "phone, schedule");
        LocalDateTime after = LocalDateTime.now();

        var records = recordsAffecting(affected.getId());
        assertThat(records).hasSize(1);
        var entry = records.get(0);
        assertThat(entry.getActor().getId()).isEqualTo(actorUser.getId());
        assertThat(entry.getUsuarioAfectado().getId()).isEqualTo(affected.getId());
        assertThat(entry.getAction()).isEqualTo("ACTUALIZAR_MENSAJERO");
        assertThat(entry.getDetails()).isEqualTo("phone, schedule");
        assertThat(entry.getTimestamp()).isBetween(before.minusSeconds(1), after.plusSeconds(1));
    }

    @Test
    void detalleNuloSeGuardaComoNulo() {
        var actorUser = persistedUser("AUDITACTOR76", "auditactor76@example.com",
                "76000001", "SUPER_USUARIO");
        var affected = persistedUser("AUDITAFECTADO76", "auditafectado76@example.com",
                "76000002", "MENSAJERO");

        audit.logAction(AuditAction.COURIER_UPDATED, authenticated(actorUser), affected, null);

        var records = recordsAffecting(affected.getId());
        assertThat(records).hasSize(1);
        assertThat(records.get(0).getDetails()).isNull();
    }

    @Test
    void detalleDe600CaracteresSeGuardaConSoloLos500Primeros() {
        var actorUser = persistedUser("AUDITACTOR76", "auditactor76@example.com",
                "76000001", "SUPER_USUARIO");
        var affected = persistedUser("AUDITAFECTADO76", "auditafectado76@example.com",
                "76000002", "MENSAJERO");
        String details = "x".repeat(600);

        audit.logAction(AuditAction.COURIER_UPDATED, authenticated(actorUser), affected, details);

        var records = recordsAffecting(affected.getId());
        assertThat(records).hasSize(1);
        assertThat(records.get(0).getDetails()).hasSize(500).isEqualTo(details.substring(0, 500));
    }

    @Test
    void registrarCreacionAdministradorGuardaTrazaEnEspanolConLimite500() {
        var actorUser = persistedUser("AUDITACTOR77", "auditactor77@example.com",
                "77000001", "SUPER_USUARIO");
        var nuevoAdmin = persistedUser("AUDITADMIN77", "auditadmin77@example.com",
                "77000002", "ADMIN_VENTAS");
        String nombreLargo = "María " + "x".repeat(100);
        nuevoAdmin.setFullName(nombreLargo);
        nuevoAdmin.setEmail("adminlargo77@example.com");
        nuevoAdmin.setPasswordHash("hashed-secret-77");
        users.saveAndFlush(nuevoAdmin);

        LocalDateTime before = LocalDateTime.now();
        audit.registrarCreacionAdministrador(authenticated(actorUser), nuevoAdmin);
        LocalDateTime after = LocalDateTime.now();

        var records = auditLogs.findAll().stream()
                .filter(log -> log.getUsuarioAfectado() != null
                        && nuevoAdmin.getId().equals(log.getUsuarioAfectado().getId()))
                .toList();
        assertThat(records).hasSize(1);
        var entry = records.get(0);
        assertThat(entry.getActor().getId()).isEqualTo(actorUser.getId());
        assertThat(entry.getUsuarioAfectado().getId()).isEqualTo(nuevoAdmin.getId());
        assertThat(entry.getAction()).isEqualTo(AuditAction.ADMIN_CREATED.getCode());
        assertThat(entry.getTimestamp()).isBetween(before.minusSeconds(1), after.plusSeconds(1));
        assertThat(entry.getDetails())
                .contains("El Super Usuario 'Usuario AUDITACTOR77'")
                .contains("creó al Administrador de Ventas '" + nombreLargo + "'")
                .contains("adminlargo77@example.com")
                .doesNotContain("hashed-secret-77");
        assertThat(entry.getDetails()).hasSizeLessThanOrEqualTo(500);
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void sinTransaccionActivaLanzaIllegalTransactionStateException() {
        long recordsBefore = auditLogs.count();
        var actor = new AuthenticatedUser(1L, DocumentType.CEDULA, "AUDITACTOR76", "Actor", "SUPER_USUARIO",
                "auditactor76@example.com");
        var affected = User.builder().documentType(DocumentType.CEDULA).documentNumber("AUDITAFECTADO76").build();

        assertThatThrownBy(() -> audit.logAction(AuditAction.COURIER_UPDATED, actor, affected, "phone"))
                .isInstanceOf(IllegalTransactionStateException.class);

        assertThat(auditLogs.count()).isEqualTo(recordsBefore);
    }
}
