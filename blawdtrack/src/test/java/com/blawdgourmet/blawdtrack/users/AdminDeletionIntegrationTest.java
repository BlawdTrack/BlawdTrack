package com.blawdgourmet.blawdtrack.users;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import jakarta.persistence.EntityManager;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:blawdtrack-admin-delete;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@Transactional
class AdminDeletionIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private JwtService jwt;
    @Autowired private AuditLogRepository audits;
    @Autowired private EntityManager entityManager;

    private String bearerFor(String roleName) {
        Role role = roles.findByName(roleName).orElseThrow();
        User actor = users.saveAndFlush(User.builder()
                .nationalId("ACTOR-" + roleName)
                .fullName("Actor " + roleName)
                .email("actor-" + roleName.toLowerCase() + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(role)
                .build());
        return "Bearer " + jwt.generateToken(new UserPrincipal(actor));
    }

    private User createAdmin(String nationalId, UserStatus status) {
        Role role = roles.findByName(RoleName.SALES_ADMIN).orElseThrow();
        return users.saveAndFlush(User.builder()
                .nationalId(nationalId)
                .fullName("Administrador prueba")
                .email(nationalId.toLowerCase() + "@example.test")
                .passwordHash("hash")
                .status(status)
                .role(role)
                .build());
    }

    @Test
    void superUsuarioPuedeEliminarAdministradorInactivo() throws Exception {
        User admin = createAdmin("ADM-001", UserStatus.INACTIVE);

        mvc.perform(delete("/api/v1/admins/{cedula}", admin.getNationalId())
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Administrador eliminado correctamente."));

        entityManager.clear();
        assertThat(users.findByNationalId(admin.getNationalId())).isEmpty();

        assertThat(audits.findAll()).anySatisfy(audit -> {
            assertThat(audit.getAction()).isEqualTo("ELIMINAR_ADMINISTRADOR");
            assertThat(audit.getDetails()).contains(admin.getNationalId());
            assertThat(audit.getActor()).isNotNull();
        });
    }

    @Test
    void administradorInexistenteDevuelve404YNoGeneraAuditoria() throws Exception {
        mvc.perform(delete("/api/v1/admins/{cedula}", "NO-EXISTE")
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Administrador no existente"));

        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void mensajeroNoPuedeEliminarAdministrador() throws Exception {
        User admin = createAdmin("ADM-002", UserStatus.INACTIVE);

        mvc.perform(delete("/api/v1/admins/{cedula}", admin.getNationalId())
                        .header("Authorization", bearerFor(RoleName.COURIER)))
                .andExpect(status().isForbidden());

        assertThat(users.findByNationalId(admin.getNationalId())).isPresent();
        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void administradorDeVentasNoPuedeEliminarAdministrador() throws Exception {
        User admin = createAdmin("ADM-003", UserStatus.INACTIVE);

        mvc.perform(delete("/api/v1/admins/{cedula}", admin.getNationalId())
                        .header("Authorization", bearerFor(RoleName.SALES_ADMIN)))
                .andExpect(status().isForbidden());

        assertThat(users.findByNationalId(admin.getNationalId())).isPresent();
        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void solicitudSinJwtDevuelve401() throws Exception {
        createAdmin("ADM-004", UserStatus.INACTIVE);

        mvc.perform(delete("/api/v1/admins/{cedula}", "ADM-004"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void intentarEliminarSuperUsuarioSeBloquea() throws Exception {
        User superUser = users.saveAndFlush(User.builder()
                .nationalId("ADM-005")
                .fullName("Super Usuario")
                .email("super-delete@example.test")
                .passwordHash("hash")
                .status(UserStatus.INACTIVE)
                .role(roles.findByName(RoleName.SUPER_USER).orElseThrow())
                .build());

        mvc.perform(delete("/api/v1/admins/{cedula}", superUser.getNationalId())
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isForbidden());

        assertThat(users.findByNationalId(superUser.getNationalId())).isPresent();
        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void administradorConSesionActivaSeBloquea() throws Exception {
        User admin = createAdmin("ADM-006", UserStatus.ACTIVE);

        mvc.perform(delete("/api/v1/admins/{cedula}", admin.getNationalId())
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El administrador tiene una sesión activa. Cierre primero la sesión antes de eliminarlo."));

        assertThat(users.findByNationalId(admin.getNationalId())).isPresent();
        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void auditoriaPermaneceTrasEliminarAdministrador() throws Exception {
        User admin = createAdmin("ADM-007", UserStatus.INACTIVE);

        mvc.perform(delete("/api/v1/admins/{cedula}", admin.getNationalId())
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isOk());

        entityManager.clear();
        assertThat(audits.findAll()).anySatisfy(audit -> {
            assertThat(audit.getAction()).isEqualTo("ELIMINAR_ADMINISTRADOR");
            assertThat(audit.getActor()).isNotNull();
            assertThat(audit.getDetails()).contains("ADM-007");
            assertThat(audit.getTimestamp()).isNotNull();
        });
    }
}
