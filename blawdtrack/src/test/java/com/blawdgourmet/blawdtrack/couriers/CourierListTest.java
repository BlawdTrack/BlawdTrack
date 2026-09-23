package com.blawdgourmet.blawdtrack.couriers;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CourierListTest {

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private CourierRepository couriers;
    @Autowired private JwtService jwt;

    private String token(String role, UserStatus status) {
        var user = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber("ACTOR90")
                .fullName("Actor").email("actor90@example.com").passwordHash("unused")
                .status(status).role(roles.findByName(role).orElseThrow()).build());
        return jwt.generateToken(new UserPrincipal(user));
    }

    private ResultActions list(String token) throws Exception {
        return mvc.perform(get("/api/v1/couriers").header("Authorization", "Bearer " + token));
    }

    private void createCourier(String fullName, String documentNumber, UserStatus status) {
        var user = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber(documentNumber)
                .fullName(fullName).email(documentNumber + "@example.com").phone(documentNumber)
                .passwordHash("unused").status(status)
                .role(roles.findByName("MENSAJERO").orElseThrow()).build());
        couriers.saveAndFlush(Courier.builder().user(user)
                .schedule("Lunes a viernes, 08:00-17:00").maxPackageWeightKg(new BigDecimal("25.00")).build());
    }

    @Test
    void superUsuarioListaMensajerosOrdenadosPorNombreIncluyendoInactivos() throws Exception {
        createCourier("Bravo Mensajero", "L1000001", UserStatus.ACTIVE);
        createCourier("Alfa Mensajero", "L1000002", UserStatus.INACTIVE);
        createCourier("Charlie Mensajero", "L1000003", UserStatus.ACTIVE);

        list(token("SUPER_USUARIO", UserStatus.ACTIVE)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].fullName").value("Alfa Mensajero"))
                .andExpect(jsonPath("$[0].documentType").value("CEDULA"))
                .andExpect(jsonPath("$[0].documentNumber").value("L1000002"))
                .andExpect(jsonPath("$[0].nationalId").doesNotExist())
                .andExpect(jsonPath("$[0].status").value("INACTIVE"))
                .andExpect(jsonPath("$[1].fullName").value("Bravo Mensajero"))
                .andExpect(jsonPath("$[2].fullName").value("Charlie Mensajero"));
    }

    @Test
    void sinMensajerosDevuelveArregloVacio() throws Exception {
        list(token("SUPER_USUARIO", UserStatus.ACTIVE)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN_VENTAS", "MENSAJERO"})
    void otrosRolesNoPuedenListar(String role) throws Exception {
        list(token(role, UserStatus.ACTIVE)).andExpect(status().isForbidden());
    }

    @Test
    void sinTokenDevuelve401() throws Exception {
        mvc.perform(get("/api/v1/couriers")).andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInvalidoDevuelve401() throws Exception {
        list("invalid-token").andExpect(status().isUnauthorized());
    }
}
