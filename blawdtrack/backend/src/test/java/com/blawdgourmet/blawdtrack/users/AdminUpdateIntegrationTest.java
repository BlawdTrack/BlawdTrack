package com.blawdgourmet.blawdtrack.users;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Actualización de datos, control de sesión e historial de un administrador (HU-007 / T02). */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminUpdateIntegrationTest {

    private static final String PATH = "/api/v1/admins/{documentType}/{documentNumber}";
    private static final String AUDIT_PATH = "/api/v1/admins/audit-log";
    private static final String JSON = MediaType.APPLICATION_JSON_VALUE;

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordEncoder passwordEncoder;

    private final AtomicInteger sequence = new AtomicInteger(1);

    @Test
    void updatesNameAndEmailAndLeavesATraceWithoutClosingTheSession() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-original@example.test");
        int versionBefore = admin.getTokenVersion();

        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON)
                        .content("{\"fullName\":\"  Ana Nueva  \",\"email\":\"Ana.Nueva@Example.test\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Ana Nueva"))
                .andExpect(jsonPath("$.email").value("ana.nueva@example.test"))
                .andExpect(jsonPath("$.documentNumber").value(admin.getDocumentNumber()))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        User saved = users.findById(admin.getId()).orElseThrow();
        assertThat(saved.getFullName()).isEqualTo("Ana Nueva");
        assertThat(saved.getEmail()).isEqualTo("ana.nueva@example.test");
        assertThat(saved.getTokenVersion()).isEqualTo(versionBefore);
        assertThat(auditLog()).contains("ACTUALIZAR_ADMINISTRADOR").contains("modificó los datos (nombre, correo)")
                .contains("Ana Nueva");
    }

    @Test
    void deactivatingTheAdminClosesTheOpenSessionImmediatelyAndIsAudited() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-activo@example.test");
        String adminToken = jwt.generateToken(new UserPrincipal(admin));
        String body = "{\"shipmentNumbers\":[\"ENV-1\"]}";
        mvc.perform(post("/api/v1/packages/shipment-numbers/compare")
                        .header("Authorization", "Bearer " + adminToken).contentType(JSON).content(body))
                .andExpect(status().isOk());
        int versionBefore = admin.getTokenVersion();

        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON)
                        .content("{\"status\":\"INACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        assertThat(users.findById(admin.getId()).orElseThrow().getTokenVersion()).isGreaterThan(versionBefore);
        // El mismo token que funcionaba un momento antes deja de ser válido.
        mvc.perform(post("/api/v1/packages/shipment-numbers/compare")
                        .header("Authorization", "Bearer " + adminToken).contentType(JSON).content(body))
                .andExpect(status().isUnauthorized());
        assertThat(auditLog()).contains("DESACTIVAR_ADMINISTRADOR");
    }

    @Test
    void reactivatingTheAdminIsAudited() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-inactivo@example.test");
        admin.changeStatus(UserStatus.INACTIVE);
        users.saveAndFlush(admin);

        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        assertThat(auditLog()).contains("ACTIVAR_ADMINISTRADOR");
    }

    @Test
    void sendingTheSameStatusChangesNothingAndLeavesNoTrace() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-mismo-estado@example.test");
        int versionBefore = admin.getTokenVersion();

        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());

        assertThat(users.findById(admin.getId()).orElseThrow().getTokenVersion()).isEqualTo(versionBefore);
        assertThat(auditLog()).doesNotContain("ACTIVAR_ADMINISTRADOR").doesNotContain("DESACTIVAR_ADMINISTRADOR");
    }

    @Test
    void changingThePasswordHashesItClosesTheSessionAndNeverLogsIt() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-clave@example.test");
        String adminToken = jwt.generateToken(new UserPrincipal(admin));
        int versionBefore = admin.getTokenVersion();

        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON)
                        .content("{\"password\":\"NuevaClave123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        User saved = users.findById(admin.getId()).orElseThrow();
        assertThat(passwordEncoder.matches("NuevaClave123", saved.getPasswordHash())).isTrue();
        assertThat(saved.getTokenVersion()).isGreaterThan(versionBefore);
        mvc.perform(post("/api/v1/packages/shipment-numbers/compare")
                        .header("Authorization", "Bearer " + adminToken).contentType(JSON)
                        .content("{\"shipmentNumbers\":[\"ENV-1\"]}"))
                .andExpect(status().isUnauthorized());
        assertThat(auditLog()).contains("CAMBIAR_CONTRASENA_ADMINISTRADOR").doesNotContain("NuevaClave123");
    }

    @Test
    void anEmailUsedByAnotherUserIsRejected() throws Exception {
        save(RoleName.COURIER, "ocupado@example.test");
        User admin = save(RoleName.SALES_ADMIN, "admin-correo@example.test");

        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON)
                        .content("{\"email\":\"OCUPADO@example.test\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_EMAIL"));

        assertThat(users.findById(admin.getId()).orElseThrow().getEmail()).isEqualTo("admin-correo@example.test");
    }

    @Test
    void keepingTheSameEmailIsNotADuplicate() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-mismo-correo@example.test");

        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON)
                        .content("{\"email\":\"ADMIN-MISMO-CORREO@example.test\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void unknownAdminOrAnotherRoleReturns404() throws Exception {
        User courier = save(RoleName.COURIER, "mensajero-objetivo@example.test");
        String superToken = token(RoleName.SUPER_USER);

        mvc.perform(patch(PATH, DocumentType.CEDULA, "1-2345-6780")
                        .header("Authorization", "Bearer " + superToken).contentType(JSON).content("{\"fullName\":\"X\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ADMINISTRADOR_NO_EXISTENTE"));
        mvc.perform(patch(PATH, courier.getDocumentType(), courier.getDocumentNumber())
                        .header("Authorization", "Bearer " + superToken).contentType(JSON).content("{\"fullName\":\"X\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void invalidBodiesAreRejectedWith400() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-validacion@example.test");
        String superToken = token(RoleName.SUPER_USER);

        for (String body : new String[] {
                "{}",
                "{\"fullName\":\"   \"}",
                "{\"email\":\"no-es-correo\"}",
                "{\"password\":\"corta1\"}",
                "{\"password\":\"soloLetrasSinNumeros\"}",
                "{\"status\":\"BLOQUEADO\"}"}) {
            mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                            .header("Authorization", "Bearer " + superToken).contentType(JSON).content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void onlyTheSuperUserCanUpdateAndAuthorizationComesBeforeValidation() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-protegido@example.test");

        for (String role : new String[] {RoleName.SALES_ADMIN, RoleName.COURIER}) {
            String roleToken = token(role);
            mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                            .header("Authorization", "Bearer " + roleToken).contentType(JSON).content("{\"fullName\":\"X\"}"))
                    .andExpect(status().isForbidden());
            // Con un cuerpo inválido sigue siendo 403: no se entera de si lo que mandó era válido.
            mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                            .header("Authorization", "Bearer " + roleToken).contentType(JSON).content("{}"))
                    .andExpect(status().isForbidden());
        }
        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .contentType(JSON).content("{\"fullName\":\"X\"}"))
                .andExpect(status().isUnauthorized());
        assertThat(users.findById(admin.getId()).orElseThrow().getFullName()).isEqualTo("Administrador de prueba");
    }

    @Test
    void theHistoryOfOneAdminListsOnlyItsOwnChangesNewestFirst() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-historial@example.test");
        User other = save(RoleName.SALES_ADMIN, "admin-otro@example.test");
        String superToken = token(RoleName.SUPER_USER);

        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + superToken).contentType(JSON).content("{\"fullName\":\"Nombre Uno\"}"))
                .andExpect(status().isOk());
        mvc.perform(patch(PATH, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + superToken).contentType(JSON).content("{\"status\":\"INACTIVE\"}"))
                .andExpect(status().isOk());
        mvc.perform(patch(PATH, other.getDocumentType(), other.getDocumentNumber())
                        .header("Authorization", "Bearer " + superToken).contentType(JSON).content("{\"fullName\":\"Nombre Ajeno\"}"))
                .andExpect(status().isOk());

        mvc.perform(get(PATH + "/history", admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + superToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].action").value("DESACTIVAR_ADMINISTRADOR"))
                .andExpect(jsonPath("$[1].action").value("ACTUALIZAR_ADMINISTRADOR"))
                .andExpect(jsonPath("$[1].details").value(org.hamcrest.Matchers.containsString("Nombre Uno")));
    }

    @Test
    void theHistoryOfAnUnknownAdminIs404AndOnlyTheSuperUserCanReadIt() throws Exception {
        User admin = save(RoleName.SALES_ADMIN, "admin-historial-403@example.test");

        mvc.perform(get(PATH + "/history", DocumentType.CEDULA, "1-2345-6780")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ADMINISTRADOR_NO_EXISTENTE"));
        for (String role : new String[] {RoleName.SALES_ADMIN, RoleName.COURIER}) {
            mvc.perform(get(PATH + "/history", admin.getDocumentType(), admin.getDocumentNumber())
                            .header("Authorization", "Bearer " + token(role)))
                    .andExpect(status().isForbidden());
        }
        mvc.perform(get(PATH + "/history", admin.getDocumentType(), admin.getDocumentNumber()))
                .andExpect(status().isUnauthorized());
    }

    private String auditLog() throws Exception {
        MvcResult result = mvc.perform(get(AUDIT_PATH).header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andReturn();
        return result.getResponse().getContentAsString();
    }

    private User save(String role, String email) {
        return users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-0200-%04d", sequence.getAndIncrement()))
                .fullName("Administrador de prueba")
                .email(email)
                .passwordHash(passwordEncoder.encode("ClaveActual123"))
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow())
                .build());
    }

    private String token(String role) {
        User actor = save(role, "actor-update-" + role + "-" + sequence.get() + "@example.test");
        return jwt.generateToken(new UserPrincipal(actor));
    }
}
