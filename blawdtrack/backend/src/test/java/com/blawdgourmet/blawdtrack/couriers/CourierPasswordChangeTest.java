package com.blawdgourmet.blawdtrack.couriers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import jakarta.persistence.EntityManager;

/** HU-004: el Súper Usuario define una nueva contraseña para el mensajero. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CourierPasswordChangeTest {

    private static final String NEW_PASSWORD = "Nueva2026x";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private CourierRepository couriers;
    @Autowired private AuditLogRepository auditLogs;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwt;
    @Autowired private EntityManager entityManager;

    private User courierUser;
    private Courier courier;

    @BeforeEach
    void courier() {
        courierUser = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440454").fullName("Mensajero Clave").email("courier-clave@example.com")
                .phone("70444054").passwordHash(passwordEncoder.encode("Anterior2026"))
                .status(UserStatus.ACTIVE).role(roles.findByName("MENSAJERO").orElseThrow()).build());
        courier = couriers.saveAndFlush(Courier.builder().user(courierUser).schedule("Lunes a viernes")
                .maxPackageWeightKg(new BigDecimal("20.00")).build());
    }

    private String tokenOf(User user) {
        return jwt.generateToken(new UserPrincipal(user));
    }

    private String superUserToken() {
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440455").fullName("Super Clave").email("super-clave@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("SUPER_USUARIO").orElseThrow()).build());
        return tokenOf(actor);
    }

    private ResultActions changePassword(String token, String password) throws Exception {
        return mvc.perform(patch("/api/v1/couriers/" + courier.getId() + "/password")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"password\":\"" + password + "\"}"));
    }

    private List<AuditLog> records() {
        entityManager.flush();
        entityManager.clear();
        return auditLogs.findAll().stream()
                .filter(log -> log.getUsuarioAfectado() != null
                        && courierUser.getId().equals(log.getUsuarioAfectado().getId())
                        && "CAMBIAR_CONTRASENA_MENSAJERO".equals(log.getAction()))
                .toList();
    }

    @Test
    void guardaLaContrasenaCifradaYCierraLaSesionActivaDelMensajero() throws Exception {
        String courierToken = tokenOf(courierUser);

        changePassword(superUserToken(), NEW_PASSWORD).andExpect(status().isNoContent());

        var stored = users.findById(courierUser.getId()).orElseThrow();
        assertThat(stored.getPasswordHash()).isNotEqualTo(NEW_PASSWORD);
        assertThat(passwordEncoder.matches(NEW_PASSWORD, stored.getPasswordHash())).isTrue();
        assertThat(stored.getTokenVersion()).isEqualTo(1);
        mvc.perform(get("/api/v1/couriers").header("Authorization", "Bearer " + courierToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void elCambioQuedaEnElHistorialSinRegistrarLaContrasena() throws Exception {
        String superToken = superUserToken();
        changePassword(superToken, NEW_PASSWORD).andExpect(status().isNoContent());

        var log = records().get(0);
        assertThat(log.getDetails()).isEqualTo("password");
        assertThat(log.getActor().getEmail()).isEqualTo("super-clave@example.com");

        mvc.perform(get("/api/v1/couriers/" + courier.getId() + "/history")
                        .header("Authorization", "Bearer " + superToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("CAMBIAR_CONTRASENA_MENSAJERO"))
                .andExpect(jsonPath("$[0].details").value("password"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"corta1", "sinnumeros", "12345678", "   "})
    void rechazaContrasenasQueNoCumplenLaPolitica(String password) throws Exception {
        changePassword(superUserToken(), password).andExpect(status().isBadRequest());

        assertThat(users.findById(courierUser.getId()).orElseThrow().getTokenVersion()).isZero();
        assertThat(records()).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN_VENTAS", "MENSAJERO"})
    void otrosRolesNoPuedenCambiarLaContrasena(String role) throws Exception {
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440456").fullName("Otro rol").email("otro-clave@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow()).build());

        changePassword(tokenOf(actor), NEW_PASSWORD).andExpect(status().isForbidden());
    }
}
