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
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
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

    private static final String RUTA = "/api/v1/admins/{documentType}/{documentNumber}";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private JwtService jwt;
    @Autowired private AuditLogRepository audits;
    @Autowired private EntityManager entityManager;

    private String bearerFor(String roleName) {
        Role role = roles.findByName(roleName).orElseThrow();
        User actor = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("ACTOR-" + roleName)
                .fullName("Actor " + roleName)
                .email("actor-" + roleName.toLowerCase() + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(role)
                .build());
        return "Bearer " + jwt.generateToken(new UserPrincipal(actor));
    }

    private User createAdmin(String documentNumber, UserStatus status) {
        return createUser(RoleName.SALES_ADMIN, DocumentType.CEDULA, documentNumber, status);
    }

    private User createUser(String roleName, DocumentType documentType, String documentNumber, UserStatus status) {
        Role role = roles.findByName(roleName).orElseThrow();
        return users.saveAndFlush(User.builder()
                .documentType(documentType)
                .documentNumber(documentNumber)
                .fullName("Usuario prueba")
                .email(roleName.toLowerCase() + "-" + documentType.name().toLowerCase() + "-"
                        + documentNumber.toLowerCase() + "@example.test")
                .passwordHash("hash")
                .status(status)
                .role(role)
                .build());
    }

    @Test
    void superUsuarioPuedeEliminarAdministradorInactivo() throws Exception {
        User admin = createAdmin("9-0000-0001", UserStatus.INACTIVE);

        mvc.perform(delete(RUTA, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Administrador eliminado correctamente."));

        entityManager.clear();
        assertThat(users.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber())).isEmpty();

        assertThat(audits.findAll()).anySatisfy(audit -> {
            assertThat(audit.getAction()).isEqualTo("ELIMINAR_ADMINISTRADOR");
            assertThat(audit.getDetails()).contains(admin.getDocumentNumber());
            assertThat(audit.getActor()).isNotNull();
        });
    }

    @Test
    void administradorInexistenteDevuelve404YNoGeneraAuditoria() throws Exception {
        mvc.perform(delete(RUTA, DocumentType.CEDULA, "9-0000-0099")
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Administrador no existente"));

        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void mensajeroNoPuedeEliminarAdministrador() throws Exception {
        User admin = createAdmin("9-0000-0002", UserStatus.INACTIVE);

        mvc.perform(delete(RUTA, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", bearerFor(RoleName.COURIER)))
                .andExpect(status().isForbidden());

        assertThat(users.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber())).isPresent();
        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void administradorDeVentasNoPuedeEliminarAdministrador() throws Exception {
        User admin = createAdmin("9-0000-0003", UserStatus.INACTIVE);

        mvc.perform(delete(RUTA, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", bearerFor(RoleName.SALES_ADMIN)))
                .andExpect(status().isForbidden());

        assertThat(users.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber())).isPresent();
        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void solicitudSinJwtDevuelve401() throws Exception {
        createAdmin("9-0000-0004", UserStatus.INACTIVE);

        mvc.perform(delete(RUTA, DocumentType.CEDULA, "9-0000-0004"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void intentarEliminarSuperUsuarioSeBloquea() throws Exception {
        User superUser = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("9-0000-0005")
                .fullName("Super Usuario")
                .email("super-delete@example.test")
                .passwordHash("hash")
                .status(UserStatus.INACTIVE)
                .role(roles.findByName(RoleName.SUPER_USER).orElseThrow())
                .build());

        mvc.perform(delete(RUTA, superUser.getDocumentType(), superUser.getDocumentNumber())
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isForbidden());

        assertThat(users.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, superUser.getDocumentNumber())).isPresent();
        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void administradorConSesionActivaSeBloquea() throws Exception {
        User admin = createAdmin("9-0000-0006", UserStatus.ACTIVE);

        mvc.perform(delete(RUTA, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El administrador tiene una sesión activa. Cierre primero la sesión antes de eliminarlo."));

        assertThat(users.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber())).isPresent();
        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void mismoNumeroDeDocumentoBajoOtroTipoEliminaAlAdministradorCorrecto() throws Exception {
        // Una CEDULA y un DIMEX pueden compartir los mismos 11-12 dígitos (unicidad por tipo + número).
        User mensajero = createUser(RoleName.COURIER, DocumentType.CEDULA, "12345678901", UserStatus.INACTIVE);
        User admin = createUser(RoleName.SALES_ADMIN, DocumentType.DIMEX, "12345678901", UserStatus.INACTIVE);
        String token = bearerFor(RoleName.SUPER_USER);

        mvc.perform(delete(RUTA, DocumentType.DIMEX, "12345678901").header("Authorization", token))
                .andExpect(status().isOk());

        entityManager.clear();
        assertThat(users.findById(admin.getId())).isEmpty();
        assertThat(users.findById(mensajero.getId())).isPresent();
    }

    @Test
    void mismoNumeroConTipoDeUnUsuarioQueNoEsAdministradorNoElimina() throws Exception {
        User mensajero = createUser(RoleName.COURIER, DocumentType.CEDULA, "12345678901", UserStatus.INACTIVE);
        createUser(RoleName.SALES_ADMIN, DocumentType.DIMEX, "12345678901", UserStatus.INACTIVE);

        mvc.perform(delete(RUTA, DocumentType.CEDULA, "12345678901")
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isForbidden());

        entityManager.clear();
        assertThat(users.findById(mensajero.getId())).isPresent();
        assertThat(audits.findAll()).isEmpty();
    }

    @Test
    void tipoDeDocumentoDesconocidoDevuelve400() throws Exception {
        mvc.perform(delete(RUTA, "NIT", "123456789")
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void numeroDeDocumentoInvalidoDevuelve400() throws Exception {
        mvc.perform(delete(RUTA, DocumentType.CEDULA, "abc")
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void auditoriaPermaneceTrasEliminarAdministrador() throws Exception {
        User admin = createAdmin("9-0000-0007", UserStatus.INACTIVE);

        mvc.perform(delete(RUTA, admin.getDocumentType(), admin.getDocumentNumber())
                        .header("Authorization", bearerFor(RoleName.SUPER_USER)))
                .andExpect(status().isOk());

        entityManager.clear();
        assertThat(audits.findAll()).anySatisfy(audit -> {
            assertThat(audit.getAction()).isEqualTo("ELIMINAR_ADMINISTRADOR");
            assertThat(audit.getActor()).isNotNull();
            assertThat(audit.getDetails()).contains("9-0000-0007");
            assertThat(audit.getTimestamp()).isNotNull();
        });
    }
}
