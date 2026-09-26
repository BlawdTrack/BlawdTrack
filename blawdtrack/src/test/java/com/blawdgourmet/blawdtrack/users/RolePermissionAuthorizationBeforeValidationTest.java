package com.blawdgourmet.blawdtrack.users;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
 * La autorizacion de /api/v1/roles/** debe resolverse antes del binding y la validacion:
 * un rol sin permiso recibe 403 aunque envie un body invalido, un JSON malformado o un
 * roleId de ruta con tipo incorrecto (sin filtrar validaciones ni provocar un 500).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RolePermissionAuthorizationBeforeValidationTest {

    private static final String JSON = MediaType.APPLICATION_JSON_VALUE;
    private static final String BODY_VALIDO = "{\"permissionIds\":[1]}";

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;

    private final AtomicInteger documentNumberSequence = new AtomicInteger(1);

    @Test
    void rolesSinPermisoRecibenForbiddenConBodyInvalidoOMalformado() throws Exception {
        for (String rol : new String[] {RoleName.SALES_ADMIN, RoleName.COURIER}) {
            String token = token(rol);
            esperar403(put("/api/v1/roles/1/permissions").contentType(JSON).content("{}"), token);
            esperar403(put("/api/v1/roles/1/permissions").contentType(JSON).content("no-es-json"), token);
        }
    }

    @Test
    void rolesSinPermisoRecibenForbiddenConRoleIdDeRutaDeTipoIncorrecto() throws Exception {
        for (String rol : new String[] {RoleName.SALES_ADMIN, RoleName.COURIER}) {
            esperar403(put("/api/v1/roles/abc/permissions").contentType(JSON).content(BODY_VALIDO), token(rol));
        }
    }

    @Test
    void solicitudSinTokenConDatosInvalidosDevuelve401() throws Exception {
        mvc.perform(put("/api/v1/roles/1/permissions").contentType(JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/v1/roles/abc/permissions").contentType(JSON).content(BODY_VALIDO))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void superUsuarioConBodyInvalidoSigueRecibiendoValidacion() throws Exception {
        mvc.perform(put("/api/v1/roles/1/permissions")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    private void esperar403(MockHttpServletRequestBuilder request, String token) throws Exception {
        mvc.perform(request.header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    private String token(String rol) {
        User user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-4000-%04d", documentNumberSequence.getAndIncrement()))
                .fullName("Actor de prueba")
                .email("actor-roles-authz-" + rol + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(rol).orElseThrow())
                .build());
        return jwt.generateToken(new UserPrincipal(user));
    }
}
