package com.blawdgourmet.blawdtrack.users;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import jakarta.persistence.EntityManager;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminCreationAuditTest {

    private static final String ACTION = "CREAR_ADMINISTRADOR";
    private static final String NEW_ADMIN_EMAIL = "admin76@example.com";
    private static final String DUPLICATE_DOC = "101010101";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private JwtService jwt;
    @Autowired private AuditLogRepository auditLogs;
    @Autowired private EntityManager entityManager;

    private User actor(String role) {
        return users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("ACTOR76")
                .fullName("Actor 76")
                .email("actor76@example.com")
                .passwordHash("unused")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow())
                .build());
    }

    private String token(User user) {
        return jwt.generateToken(new UserPrincipal(user));
    }

    private static String body(String documentNumber, String email, String password) {
        return """
                {
                  "nombreCompleto": "Administrador de prueba 76",
                  "numeroTelefono": "87654321",
                  "correoElectronico": "%s",
                  "contrasenaInicial": "%s",
                  "documentType": "CEDULA",
                  "documentNumber": "%s"
                }
                """.formatted(email, password, documentNumber);
    }

    private List<AuditLog> adminAuditRecords() {
        entityManager.flush();
        entityManager.clear();
        return auditLogs.findAll().stream()
                .filter(log -> log.getUsuarioAfectado() != null && ACTION.equals(log.getAction()))
                .toList();
    }

    @Test
    void superUsuarioCreaAdministradorGeneraUnRegistroConActorAfectadoYFecha() throws Exception {
        var actorUser = actor("SUPER_USUARIO");
        String token = token(actorUser);
        long before = auditLogs.count();

        mvc.perform(post("/api/v1/admins")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(DUPLICATE_DOC, NEW_ADMIN_EMAIL, "Clave1234")))
                .andExpect(status().isCreated());

        var records = adminAuditRecords();
        assertThat(records).hasSize(1);
        var entry = records.get(0);
        assertThat(entry.getAction()).isEqualTo(ACTION);
        assertThat(entry.getActor().getId()).isEqualTo(actorUser.getId());
        assertThat(entry.getUsuarioAfectado()).isNotNull();
        assertThat(entry.getUsuarioAfectado().getEmail()).isEqualTo(NEW_ADMIN_EMAIL);
        assertThat(entry.getTimestamp()).isNotNull();
        assertThat(auditLogs.count()).isEqualTo(before + 1);
    }

    @Test
    void documentoDuplicadoNoGeneraRegistroNuevo() throws Exception {
        var actorUser = actor("SUPER_USUARIO");
        String token = token(actorUser);
        users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(DUPLICATE_DOC)
                .fullName("Admin existente")
                .email("otro@example.com")
                .passwordHash("unused")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName("ADMIN_VENTAS").orElseThrow())
                .build());
        long before = auditLogs.count();

        mvc.perform(post("/api/v1/admins")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(DUPLICATE_DOC, "newadmin@example.com", "Clave1234")))
                .andExpect(status().isConflict());

        assertThat(auditLogs.count()).isEqualTo(before);
    }

    @Test
    void correoDuplicadoNoGeneraRegistroNuevo() throws Exception {
        var actorUser = actor("SUPER_USUARIO");
        String token = token(actorUser);
        users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("999999999")
                .fullName("Correo existente")
                .email(NEW_ADMIN_EMAIL)
                .passwordHash("unused")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName("ADMIN_VENTAS").orElseThrow())
                .build());
        long before = auditLogs.count();

        mvc.perform(post("/api/v1/admins")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("222222222", NEW_ADMIN_EMAIL, "Clave1234")))
                .andExpect(status().isConflict());

        assertThat(auditLogs.count()).isEqualTo(before);
    }

    @Test
    void cuerpoInvalidoNoGeneraRegistroNuevo() throws Exception {
        var actorUser = actor("SUPER_USUARIO");
        String token = token(actorUser);
        long before = auditLogs.count();

        mvc.perform(post("/api/v1/admins")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombreCompleto": "Administrador 76",
                                  "numeroTelefono": "87654321",
                                  "correoElectronico": "admin-invalid@example.com",
                                  "contrasenaInicial": "sinNumero",
                                  "documentType": "CEDULA",
                                  "documentNumber": "333333333"
                                }
                                """))
                .andExpect(status().isBadRequest());

        assertThat(auditLogs.count()).isEqualTo(before);
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN_VENTAS", "MENSAJERO"})
    void actorSinPermisoNoGeneraRegistroNuevo(String role) throws Exception {
        var actorUser = actor(role);
        String token = token(actorUser);
        long before = auditLogs.count();

        mvc.perform(post("/api/v1/admins")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("444444444", "forbidden@example.com", "Clave1234")))
                .andExpect(status().isForbidden());

        assertThat(auditLogs.count()).isEqualTo(before);
    }
}
