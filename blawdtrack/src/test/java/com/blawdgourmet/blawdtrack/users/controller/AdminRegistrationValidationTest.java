package com.blawdgourmet.blawdtrack.users.controller;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@SuppressWarnings("unused")
class AdminRegistrationValidationTest {

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private JwtService jwt;

    @MockitoBean
    private com.blawdgourmet.blawdtrack.audit.service.AuditService auditService;

    private String token(String role, UserStatus status) {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        var user = users.saveAndFlush(User.builder().documentId("ACTOR_" + suffix)
                .fullName("Actor admin").email("actor-" + suffix + "@example.com").passwordHash("unused")
                .status(status).role(roles.findByName(role).orElseThrow()).build());
        return jwt.generateToken(new UserPrincipal(user));
    }

    @Test
    void registraAdministradorValido() throws Exception {
        var count = users.count();
        mvc.perform(post("/api/v1/admins")
                .header("Authorization", "Bearer " + token("SUPER_USUARIO", UserStatus.ACTIVE))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"ana.admin@example.com","contrasenaInicial":"Clave1234","documentType":"CEDULA","documentNumber":"123456789"}
                        """))
                .andExpect(status().isCreated());
        assertThat(users.count()).isGreaterThan(count);
    }

    @Test
    void rechazaCorreoInvalidoYUserHost() throws Exception {
        String token = "Bearer " + token("SUPER_USUARIO", UserStatus.ACTIVE);
        var before = users.count();
        mvc.perform(post("/api/v1/admins")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"user@host","contrasenaInicial":"Clave1234","documentType":"CEDULA","documentNumber":"123456789"}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        assertThat(users.count()).isEqualTo(before);
    }

    @Test
    void rechazaDocumentoInvalidoYReportaField() throws Exception {
        mvc.perform(post("/api/v1/admins")
                .header("Authorization", "Bearer " + token("SUPER_USUARIO", UserStatus.ACTIVE))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"ana@example.com","contrasenaInicial":"Clave1234","documentType":"CEDULA","documentNumber":"12345678"}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores[0].campo").value("documentNumber"));
    }

    @Test
    void requiereDocumentTypeYNoPermiteNulo() throws Exception {
        mvc.perform(post("/api/v1/admins")
                .header("Authorization", "Bearer " + token("SUPER_USUARIO", UserStatus.ACTIVE))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"ana@example.com","contrasenaInicial":"Clave1234","documentNumber":"123456789"}
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rechazaDocumentoDuplicadoConSeparadores() throws Exception {
        users.saveAndFlush(User.builder().documentId("123456789").fullName("Existente").email("otro@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE).role(roles.findByName("ADMIN_VENTAS").orElseThrow()).build());
        mvc.perform(post("/api/v1/admins")
                .header("Authorization", "Bearer " + token("SUPER_USUARIO", UserStatus.ACTIVE))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"new@example.com","contrasenaInicial":"Clave1234","documentType":"CEDULA","documentNumber":"1-2345-6789"}
                        """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DOCUMENTO_DUPLICADO"));
    }

    @Test
    void rechazaCorreoDuplicadoSinDistinguirMayusculas() throws Exception {
        users.saveAndFlush(User.builder().documentId("987654321").fullName("Existente").email("duplicado@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE).role(roles.findByName("ADMIN_VENTAS").orElseThrow()).build());
        mvc.perform(post("/api/v1/admins")
                .header("Authorization", "Bearer " + token("SUPER_USUARIO", UserStatus.ACTIVE))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"Duplicado@Example.com","contrasenaInicial":"Clave1234","documentType":"CEDULA","documentNumber":"555555555"}
                        """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_EMAIL"));
    }

    @Test
    void mismoNumeroConDistintoTipoSePermite() throws Exception {
        mvc.perform(post("/api/v1/admins")
                .header("Authorization", "Bearer " + token("SUPER_USUARIO", UserStatus.ACTIVE))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"ana@example.com","contrasenaInicial":"Clave1234","documentType":"DIMEX","documentNumber":"123456789"}
                        """))
                .andExpect(status().isCreated());
    }

    @Test
    void otrosRolesQuedanProhibidos() throws Exception {
        mvc.perform(post("/api/v1/admins")
                .header("Authorization", "Bearer " + token("ADMIN_VENTAS", UserStatus.ACTIVE))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"ana@example.com","contrasenaInicial":"Clave1234","documentType":"CEDULA","documentNumber":"123456789"}
                        """))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/admins")
                .header("Authorization", "Bearer " + token("MENSAJERO", UserStatus.ACTIVE))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"ana2@example.com","contrasenaInicial":"Clave1234","documentType":"CEDULA","documentNumber":"1234567890"}
                        """))
                .andExpect(status().isForbidden());
    }

    @Test
    void requiereTokenValido() throws Exception {
        mvc.perform(post("/api/v1/admins")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombreCompleto":"Ana Admin","numeroTelefono":"88888888","correoElectronico":"ana@example.com","contrasenaInicial":"Clave1234","documentType":"CEDULA","documentNumber":"123456789"}
                        """))
                .andExpect(status().isUnauthorized());
    }
}
