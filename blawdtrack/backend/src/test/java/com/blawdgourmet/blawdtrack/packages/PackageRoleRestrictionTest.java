package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

/**
 * HU-012 / T02 (#118): la eliminacion de paquetes (DELETE /api/v1/packages/{numeroEnvio}) es
 * exclusiva del rol Administrador de Ventas. Un usuario autenticado con otro rol recibe 403 y
 * una solicitud sin token recibe 401.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PackageRoleRestrictionTest {

    private static final String DELETE_URL = "/api/v1/packages/ENV-0001";

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;

    private final AtomicInteger documentNumberSequence = new AtomicInteger(1);

    @Test
    void solicitudSinTokenDevuelve401() throws Exception {
        mvc.perform(delete(DELETE_URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInvalidoDevuelve401() throws Exception {
        mvc.perform(delete(DELETE_URL).header("Authorization", "Bearer token-invalido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void mensajeroRecibe403() throws Exception {
        mvc.perform(delete(DELETE_URL).header("Authorization", "Bearer " + token(RoleName.COURIER)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void superUsuarioRecibe403() throws Exception {
        mvc.perform(delete(DELETE_URL).header("Authorization", "Bearer " + token(RoleName.SUPER_USER)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void administradorDeVentasSuperaLaRestriccionDeRol() throws Exception {
        int httpStatus = mvc.perform(
                        delete(DELETE_URL).header("Authorization", "Bearer " + token(RoleName.SALES_ADMIN)))
                .andReturn().getResponse().getStatus();

        // Aun no existe el endpoint (T01): lo unico que se verifica aqui es que la restriccion
        // de rol no lo bloquea. Cuando T01 este integrado, este caso debe afirmar 200/404/409.
        assertThat(httpStatus).isNotIn(401, 403);
    }

    private String token(String rol) {
        User user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-3100-%04d", documentNumberSequence.getAndIncrement()))
                .fullName("Actor de prueba")
                .email("actor-package-authz-" + rol + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(rol).orElseThrow())
                .build());
        return jwt.generateToken(new UserPrincipal(user));
    }
}
