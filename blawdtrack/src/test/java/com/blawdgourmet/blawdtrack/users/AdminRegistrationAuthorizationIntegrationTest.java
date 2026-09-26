package com.blawdgourmet.blawdtrack.users;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

/**
 * La autorización de POST /api/v1/admins debe resolverse antes del binding y la
 * validación del body: un rol sin permiso recibe 403 aunque envíe un body inválido.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminRegistrationAuthorizationIntegrationTest {

    private static final String RUTA = "/api/v1/admins";
    private static final String BODY_INVALIDO = "{}";

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;

    private final AtomicInteger documentNumberSequence = new AtomicInteger(1);

    @Test
    void rolesOperativosConBodyInvalidoRecibenForbiddenYNoValidacion() throws Exception {
        mvc.perform(post(RUTA)
                        .header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY_INVALIDO))
                .andExpect(status().isForbidden());
        mvc.perform(post(RUTA)
                        .header("Authorization", "Bearer " + token(RoleName.COURIER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY_INVALIDO))
                .andExpect(status().isForbidden());
    }

    @Test
    void solicitudSinTokenConBodyInvalidoDevuelve401() throws Exception {
        mvc.perform(post(RUTA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY_INVALIDO))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void superUsuarioConBodyInvalidoSigueRecibiendoValidacion() throws Exception {
        mvc.perform(post(RUTA)
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY_INVALIDO))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    private String token(String rol) {
        User user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-1000-%04d", documentNumberSequence.getAndIncrement()))
                .fullName("Actor de prueba")
                .email("actor-registro-" + rol + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(rol).orElseThrow())
                .build());
        return jwt.generateToken(new UserPrincipal(user));
    }
}
