package com.blawdgourmet.blawdtrack.couriers;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
 * La autorizacion de /api/v1/couriers/** debe resolverse antes del binding y la validacion:
 * un rol sin permiso recibe 403 aunque envie un body invalido, un JSON malformado o un id
 * de ruta con tipo incorrecto (sin filtrar validaciones ni provocar un 500).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CourierAuthorizationBeforeValidationTest {

    private static final String JSON = MediaType.APPLICATION_JSON_VALUE;

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;

    private final AtomicInteger documentNumberSequence = new AtomicInteger(1);

    @Test
    void rolesSinPermisoRecibenForbiddenConBodyInvalido() throws Exception {
        for (String rol : new String[] {RoleName.SALES_ADMIN, RoleName.COURIER}) {
            String token = token(rol);
            esperar403(post("/api/v1/couriers").contentType(JSON).content("{}"), token);
            esperar403(put("/api/v1/couriers/1").contentType(JSON).content("{}"), token);
        }
    }

    @Test
    void rolesSinPermisoRecibenForbiddenConJsonMalformado() throws Exception {
        for (String rol : new String[] {RoleName.SALES_ADMIN, RoleName.COURIER}) {
            esperar403(post("/api/v1/couriers").contentType(JSON).content("no-es-json"), token(rol));
        }
    }

    @Test
    void rolesSinPermisoRecibenForbiddenConIdDeRutaDeTipoIncorrecto() throws Exception {
        for (String rol : new String[] {RoleName.SALES_ADMIN, RoleName.COURIER}) {
            String token = token(rol);
            esperar403(put("/api/v1/couriers/abc").contentType(JSON).content("{}"), token);
            esperar403(patch("/api/v1/couriers/abc/deactivate"), token);
        }
    }

    @Test
    void solicitudSinTokenConDatosInvalidosDevuelve401() throws Exception {
        mvc.perform(post("/api/v1/couriers").contentType(JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/v1/couriers/abc").contentType(JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void superUsuarioConBodyInvalidoSigueRecibiendoValidacion() throws Exception {
        mvc.perform(post("/api/v1/couriers")
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    private void esperar403(MockHttpServletRequestBuilder request, String token) throws Exception {
        mvc.perform(request.header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    private String token(String rol) {
        User user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.format("9-3000-%04d", documentNumberSequence.getAndIncrement()))
                .fullName("Actor de prueba")
                .email("actor-courier-authz-" + rol + "@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(rol).orElseThrow())
                .build());
        return jwt.generateToken(new UserPrincipal(user));
    }
}
