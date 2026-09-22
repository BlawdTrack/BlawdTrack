package com.blawdgourmet.blawdtrack.couriers;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CourierUpdateAuditTest {
    private static final String ACTION = "ACTUALIZAR_MENSAJERO";
    private static final String DOCUMENT_NUMBER = "COURIER76";
    private static final String ORIGINAL_NAME = "Mensajero original 76";
    private static final String ORIGINAL_EMAIL = "courier76@example.com";
    private static final String ORIGINAL_PHONE = "76100001";
    private static final String ORIGINAL_SCHEDULE = "Lunes a viernes, 08:00-17:00";
    private static final String ORIGINAL_WEIGHT = "25.50";
    private static final String ORIGINAL_PASSWORD_HASH = "hash-original-76";
    private static final String OTHER_EMAIL = "other76@example.com";
    private static final String OTHER_PHONE = "76100002";

    private static final String NEW_NAME = "Nombre nuevo 76";
    private static final String NEW_EMAIL = "courier76-nuevo@example.com";
    private static final String NEW_PHONE = "76200001";
    private static final String NEW_SCHEDULE = "Sábado y domingo, 09:00-14:00";
    private static final String NEW_WEIGHT = "40.75";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private CourierRepository couriers;
    @Autowired private AuditLogRepository auditLogs;
    @Autowired private JwtService jwt;
    @Autowired private EntityManager entityManager;

    private Long courierUserId;
    private Long courierId;

    @BeforeEach
    void courierAndOtherUser() {
        var user = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber(DOCUMENT_NUMBER)
                .fullName(ORIGINAL_NAME).email(ORIGINAL_EMAIL).phone(ORIGINAL_PHONE)
                .passwordHash(ORIGINAL_PASSWORD_HASH).status(UserStatus.ACTIVE)
                .role(roles.findByName("MENSAJERO").orElseThrow()).build());
        var courier = couriers.saveAndFlush(Courier.builder().user(user).schedule(ORIGINAL_SCHEDULE)
                .maxPackageWeightKg(new BigDecimal(ORIGINAL_WEIGHT)).build());
        users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber("OTHER76")
                .fullName("Otro usuario 76").email(OTHER_EMAIL).phone(OTHER_PHONE)
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("ADMIN_VENTAS").orElseThrow()).build());
        courierUserId = user.getId();
        courierId = courier.getId();
    }

    private User actor(String role) {
        return users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber("ACTOR76")
                .fullName("Actor 76").email("actor76@example.com").passwordHash("unused")
                .status(UserStatus.ACTIVE).role(roles.findByName(role).orElseThrow()).build());
    }

    private String token(User user) {
        return jwt.generateToken(new UserPrincipal(user));
    }

    private static String body(String fullName, String email, String phone, String schedule, String weight) {
        return """
                {"fullName":"%s","email":"%s","phone":"%s","schedule":"%s","maxPackageWeightKg":%s}
                """.formatted(fullName, email, phone, schedule, weight);
    }

    private ResultActions update(String token, Long courierId, String body) throws Exception {
        return mvc.perform(put("/api/v1/couriers/" + courierId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private List<AuditLog> courierRecords() {
        entityManager.flush();
        entityManager.clear();
        return auditLogs.findAll().stream()
                .filter(log -> log.getUsuarioAfectado() != null
                        && courierUserId.equals(log.getUsuarioAfectado().getId())
                        && ACTION.equals(log.getAction()))
                .toList();
    }

    private void assertNoNewRecords(long recordsBefore) {
        assertThat(courierRecords()).isEmpty();
        assertThat(auditLogs.count()).isEqualTo(recordsBefore);
    }

    @Test
    void cincoCamposModificadosGeneranUnRegistroConActorAfectadoFechaYDetalle() throws Exception {
        var actorUser = actor("SUPER_USUARIO");
        var token = token(actorUser);

        LocalDateTime before = LocalDateTime.now();
        update(token, courierId, body(NEW_NAME, NEW_EMAIL, NEW_PHONE, NEW_SCHEDULE, NEW_WEIGHT))
                .andExpect(status().isOk());
        LocalDateTime after = LocalDateTime.now();

        var records = courierRecords();
        assertThat(records).hasSize(1);
        var entry = records.get(0);
        assertThat(entry.getAction()).isEqualTo(ACTION);
        assertThat(entry.getActor().getId()).isEqualTo(actorUser.getId());
        assertThat(entry.getUsuarioAfectado().getId()).isEqualTo(courierUserId);
        assertThat(entry.getTimestamp()).isBetween(before.minusSeconds(1), after.plusSeconds(1));
        assertThat(entry.getDetails()).isEqualTo("fullName, email, phone, schedule, maxPackageWeightKg");
    }

    @Test
    void soloCambiaElHorarioYElDetalleLoIndica() throws Exception {
        var token = token(actor("SUPER_USUARIO"));

        update(token, courierId,
                body(ORIGINAL_NAME, ORIGINAL_EMAIL, ORIGINAL_PHONE, NEW_SCHEDULE, ORIGINAL_WEIGHT))
                .andExpect(status().isOk());

        var records = courierRecords();
        assertThat(records).hasSize(1);
        assertThat(records.get(0).getDetails()).isEqualTo("schedule");
    }

    @Test
    void cambianTelefonoYPesoYElDetalleLosIndicaEnOrden() throws Exception {
        var token = token(actor("SUPER_USUARIO"));

        update(token, courierId,
                body(ORIGINAL_NAME, ORIGINAL_EMAIL, NEW_PHONE, ORIGINAL_SCHEDULE, NEW_WEIGHT))
                .andExpect(status().isOk());

        var records = courierRecords();
        assertThat(records).hasSize(1);
        assertThat(records.get(0).getDetails()).isEqualTo("phone, maxPackageWeightKg");
    }

    @Test
    void cuerpoConLosValoresOriginalesResponde200SinRegistro() throws Exception {
        var token = token(actor("SUPER_USUARIO"));
        long recordsBefore = auditLogs.count();

        update(token, courierId,
                body(ORIGINAL_NAME, ORIGINAL_EMAIL, ORIGINAL_PHONE, ORIGINAL_SCHEDULE, ORIGINAL_WEIGHT))
                .andExpect(status().isOk());

        assertNoNewRecords(recordsBefore);
    }

    @Test
    void pesoEquivalenteNumericamenteResponde200SinRegistro() throws Exception {
        var token = token(actor("SUPER_USUARIO"));
        long recordsBefore = auditLogs.count();

        update(token, courierId,
                body(ORIGINAL_NAME, ORIGINAL_EMAIL, ORIGINAL_PHONE, ORIGINAL_SCHEDULE, "25.5"))
                .andExpect(status().isOk());

        assertNoNewRecords(recordsBefore);
    }

    @Test
    void elDetalleNoContieneHashNiValoresAnterioresNiNuevos() throws Exception {
        var token = token(actor("SUPER_USUARIO"));

        update(token, courierId, body(NEW_NAME, NEW_EMAIL, NEW_PHONE, NEW_SCHEDULE, NEW_WEIGHT))
                .andExpect(status().isOk());

        var records = courierRecords();
        assertThat(records).hasSize(1);
        assertThat(records.get(0).getDetails()).doesNotContain(
                ORIGINAL_PASSWORD_HASH,
                ORIGINAL_NAME, NEW_NAME,
                ORIGINAL_EMAIL, NEW_EMAIL,
                ORIGINAL_PHONE, NEW_PHONE,
                ORIGINAL_SCHEDULE, NEW_SCHEDULE,
                ORIGINAL_WEIGHT, NEW_WEIGHT);
    }

    @Test
    void cedulaInexistenteDevuelve404SinRegistro() throws Exception {
        var token = token(actor("SUPER_USUARIO"));
        long recordsBefore = auditLogs.count();

        update(token, 999999999L,
                body(NEW_NAME, NEW_EMAIL, NEW_PHONE, NEW_SCHEDULE, NEW_WEIGHT))
                .andExpect(status().isNotFound());

        assertNoNewRecords(recordsBefore);
    }

    @Test
    void correoDeOtroUsuarioDevuelve409SinRegistro() throws Exception {
        var token = token(actor("SUPER_USUARIO"));
        long recordsBefore = auditLogs.count();

        update(token, courierId,
                body(NEW_NAME, " OTHER76@EXAMPLE.COM ", NEW_PHONE, NEW_SCHEDULE, NEW_WEIGHT))
                .andExpect(status().isConflict());

        assertNoNewRecords(recordsBefore);
    }

    @Test
    void telefonoDeOtroUsuarioDevuelve409SinRegistro() throws Exception {
        var token = token(actor("SUPER_USUARIO"));
        long recordsBefore = auditLogs.count();

        update(token, courierId,
                body(NEW_NAME, NEW_EMAIL, OTHER_PHONE, NEW_SCHEDULE, NEW_WEIGHT))
                .andExpect(status().isConflict());

        assertNoNewRecords(recordsBefore);
    }

    @ParameterizedTest
    @ValueSource(strings = {"invalid-email", "missing"})
    void datosInvalidosDevuelven400SinRegistro(String scenario) throws Exception {
        var token = token(actor("SUPER_USUARIO"));
        long recordsBefore = auditLogs.count();
        String body = scenario.equals("invalid-email")
                ? body(NEW_NAME, "invalid", NEW_PHONE, NEW_SCHEDULE, NEW_WEIGHT)
                : "{}";

        update(token, courierId, body).andExpect(status().isBadRequest());

        assertNoNewRecords(recordsBefore);
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN_VENTAS", "MENSAJERO"})
    void otrosRolesRecibe403SinRegistro(String role) throws Exception {
        var token = token(actor(role));
        long recordsBefore = auditLogs.count();

        update(token, courierId, body(NEW_NAME, NEW_EMAIL, NEW_PHONE, NEW_SCHEDULE, NEW_WEIGHT))
                .andExpect(status().isForbidden());

        assertNoNewRecords(recordsBefore);
    }
}
