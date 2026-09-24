package com.blawdgourmet.blawdtrack.users;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:blawdtrack-elegibilidad-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@Transactional
class AdminEliminacionElegibilidadIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;

    private final AtomicInteger nationalIdSequence = new AtomicInteger(1);

    @Test
    void superUsuarioConsultaAdministradorSinSesionReciente() throws Exception {
        User admin = guardarUsuario(RoleName.SALES_ADMIN, "admin-sin-sesion@example.test", null);

        mvc.perform(get("/api/v1/admins/{documentNumber}/elegibilidad-eliminacion", admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.elegibleParaEliminar").value(true))
                .andExpect(jsonPath("$.tieneSesionActiva").value(false))
                .andExpect(jsonPath("$.motivoNoElegible").doesNotExist());
    }

    @Test
    void superUsuarioConsultaAdministradorConSesionReciente() throws Exception {
        User admin = guardarUsuario(RoleName.SALES_ADMIN, "admin-con-sesion@example.test", LocalDateTime.now());

        mvc.perform(get("/api/v1/admins/{documentNumber}/elegibilidad-eliminacion", admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.elegibleParaEliminar").value(false))
                .andExpect(jsonPath("$.tieneSesionActiva").value(true))
                .andExpect(jsonPath("$.motivoNoElegible").isNotEmpty());
    }

    @Test
    void cedulaInexistenteDevuelve404ConCodigoDeNegocio() throws Exception {
        mvc.perform(get("/api/v1/admins/{documentNumber}/elegibilidad-eliminacion", "1-2345-6780")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ADMINISTRADOR_NO_EXISTENTE"));
    }

    @Test
    void cedulaInvalidaDevuelve400() throws Exception {
        mvc.perform(get("/api/v1/admins/{documentNumber}/elegibilidad-eliminacion", "abc")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rolesOperativosNoPuedenConsultar() throws Exception {
        User admin = guardarUsuario(RoleName.SALES_ADMIN, "admin-objetivo@example.test", null);

        mvc.perform(get("/api/v1/admins/{documentNumber}/elegibilidad-eliminacion", admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admins/{documentNumber}/elegibilidad-eliminacion", admin.getDocumentNumber())
                        .header("Authorization", "Bearer " + token(RoleName.COURIER)))
                .andExpect(status().isForbidden());
    }

    @Test
    void solicitudSinTokenDevuelve401() throws Exception {
        mvc.perform(get("/api/v1/admins/{documentNumber}/elegibilidad-eliminacion", "1-2345-6789"))
                .andExpect(status().isUnauthorized());
    }

    private User guardarUsuario(String rol, String correo, LocalDateTime lastLoginAt) {
        User user = User.builder()
            .documentType(DocumentType.CEDULA)
            .documentNumber(String.format("9-0000-%04d", nationalIdSequence.getAndIncrement()))
                .fullName("Administrador de prueba")
                .email(correo)
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(rol).orElseThrow())
                .lastLoginAt(lastLoginAt)
                .build();
        return users.saveAndFlush(user);
    }

    private String token(String rol) {
        User user = guardarUsuario(rol, "actor-" + rol + "@example.test", null);
        return jwt.generateToken(new UserPrincipal(user));
    }
}