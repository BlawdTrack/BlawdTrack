package com.blawdgourmet.blawdtrack.couriers;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CourierUpdateTest {
    private static final String NATIONAL_ID = "COURIER74";
    private static final String ORIGINAL_NAME = "Mensajero original";
    private static final String ORIGINAL_EMAIL = "courier74@example.com";
    private static final String ORIGINAL_PHONE = "70000074";
    private static final String ORIGINAL_SCHEDULE = "Lunes a viernes, 08:00-17:00";
    private static final String ORIGINAL_PASSWORD_HASH = "hash-original-74";
    private static final String OTHER_EMAIL = "other74@example.com";
    private static final String OTHER_PHONE = "71111174";

    private static final String BODY = """
            {"fullName":"Nombre actualizado","email":"courier74-nuevo@example.com",
             "phone":"72222274","schedule":"Sábado y domingo, 09:00-14:00",
             "maxPackageWeightKg":40.75}
            """;

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private CourierRepository couriers;
    @Autowired private JwtService jwt;
    @Autowired private EntityManager entityManager;

    @BeforeEach
    void courierAndOtherUser() {
        var user = users.saveAndFlush(User.builder().documentId(NATIONAL_ID)
                .fullName(ORIGINAL_NAME).email(ORIGINAL_EMAIL).phone(ORIGINAL_PHONE)
                .passwordHash(ORIGINAL_PASSWORD_HASH).status(UserStatus.ACTIVE)
                .role(roles.findByName("MENSAJERO").orElseThrow()).build());
        couriers.saveAndFlush(Courier.builder().user(user).schedule(ORIGINAL_SCHEDULE)
                .maxPackageWeightKg(new BigDecimal("25.50")).build());
        users.saveAndFlush(User.builder().documentId("OTHER74")
                .fullName("Otro usuario").email(OTHER_EMAIL).phone(OTHER_PHONE)
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("ADMIN_VENTAS").orElseThrow()).build());
    }

    private String token(String role, UserStatus status) {
        var user = users.saveAndFlush(User.builder().documentId("ACTOR74")
                .fullName("Actor").email("actor74@example.com").passwordHash("unused")
                .status(status).role(roles.findByName(role).orElseThrow()).build());
        return jwt.generateToken(new UserPrincipal(user));
    }

    private ResultActions update(String token, String documentId, String body) throws Exception {
        return mvc.perform(put("/api/v1/couriers/" + documentId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private Courier reloadCourier() {
        entityManager.flush();
        entityManager.clear();
        return couriers.findByUserDocumentId(NATIONAL_ID).orElseThrow();
    }

    private void assertDataUnchanged() {
        var courier = reloadCourier();
        var user = courier.getUser();
        assertThat(user.getFullName()).isEqualTo(ORIGINAL_NAME);
        assertThat(user.getEmail()).isEqualTo(ORIGINAL_EMAIL);
        assertThat(user.getPhone()).isEqualTo(ORIGINAL_PHONE);
        assertThat(courier.getSchedule()).isEqualTo(ORIGINAL_SCHEDULE);
        assertThat(courier.getMaxPackageWeightKg()).isEqualByComparingTo("25.50");
    }

    @Test
    void superUsuarioActualizaDatosDelMensajero() throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);
        var before = reloadCourier().getUser();
        Long userId = before.getId();
        String roleName = before.getRole().getName();

        update(token, NATIONAL_ID, BODY).andExpect(status().isOk())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        var courier = reloadCourier();
        var user = courier.getUser();
        assertThat(user.getId()).isEqualTo(userId);
        assertThat(user.getFullName()).isEqualTo("Nombre actualizado");
        assertThat(user.getEmail()).isEqualTo("courier74-nuevo@example.com");
        assertThat(user.getPhone()).isEqualTo("72222274");
        assertThat(courier.getSchedule()).isEqualTo("Sábado y domingo, 09:00-14:00");
        assertThat(courier.getMaxPackageWeightKg()).isEqualByComparingTo("40.75");
        assertThat(user.getDocumentId()).isEqualTo(NATIONAL_ID);
        assertThat(user.getPasswordHash()).isEqualTo(ORIGINAL_PASSWORD_HASH);
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(user.getRole().getName()).isEqualTo(roleName).isEqualTo("MENSAJERO");
    }

    @Test
    void mismoCorreoYTelefonoSinCambiosNoGeneraConflicto() throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);
        String body = BODY.replace("courier74-nuevo@example.com", ORIGINAL_EMAIL)
                .replace("72222274", ORIGINAL_PHONE);

        update(token, NATIONAL_ID, body).andExpect(status().isOk());

        var courier = reloadCourier();
        assertThat(courier.getUser().getEmail()).isEqualTo(ORIGINAL_EMAIL);
        assertThat(courier.getUser().getPhone()).isEqualTo(ORIGINAL_PHONE);
        assertThat(courier.getUser().getFullName()).isEqualTo("Nombre actualizado");
        assertThat(courier.getSchedule()).isEqualTo("Sábado y domingo, 09:00-14:00");
    }

    @Test
    void correoDeOtroUsuarioSeRechaza() throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);
        String body = BODY.replace("courier74-nuevo@example.com", " OTHER74@EXAMPLE.COM ");

        update(token, NATIONAL_ID, body).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("COURIER_CONFLICT"))
                .andExpect(jsonPath("$.message").value("El correo ya está registrado"));
        assertDataUnchanged();
    }

    @Test
    void telefonoDeOtroUsuarioSeRechaza() throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);
        String body = BODY.replace("72222274", OTHER_PHONE);

        update(token, NATIONAL_ID, body).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("COURIER_CONFLICT"))
                .andExpect(jsonPath("$.message").value("El teléfono ya está registrado"));
        assertDataUnchanged();
    }

    @Test
    void cedulaInexistenteDevuelve404() throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);

        update(token, "NO-EXISTE-74", BODY).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("COURIER_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Mensajero no encontrado"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN_VENTAS", "MENSAJERO"})
    void otrosRolesNoPuedenActualizar(String role) throws Exception {
        update(token(role, UserStatus.ACTIVE), NATIONAL_ID, BODY).andExpect(status().isForbidden());
        assertDataUnchanged();
    }

    @ParameterizedTest
    @ValueSource(strings = {"invalid-email", "blank-name", "blank-schedule",
            "zero-weight", "negative-weight", "precision", "missing"})
    void datosInvalidosSeRechazan(String scenario) throws Exception {
        var token = token("SUPER_USUARIO", UserStatus.ACTIVE);
        String body = switch (scenario) {
            case "invalid-email" -> BODY.replace("courier74-nuevo@example.com", "invalid");
            case "blank-name" -> BODY.replace("Nombre actualizado", " ");
            case "blank-schedule" -> BODY.replace("Sábado y domingo, 09:00-14:00", " ");
            case "zero-weight" -> BODY.replace("40.75", "0");
            case "negative-weight" -> BODY.replace("40.75", "-1");
            case "precision" -> BODY.replace("40.75", "1.001");
            default -> "{}";
        };

        update(token, NATIONAL_ID, body).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        assertDataUnchanged();
    }
}
