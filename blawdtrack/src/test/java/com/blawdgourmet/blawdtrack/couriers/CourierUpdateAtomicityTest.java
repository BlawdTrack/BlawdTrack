package com.blawdgourmet.blawdtrack.couriers;

import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sin @Transactional: necesita commits reales para comprobar que, si la auditoría falla,
 * se revierte también el cambio ya aplicado con saveAndFlush.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CourierUpdateAtomicityTest {
    private static final String COURIER_NATIONAL_ID = "COURIER76X";
    private static final String ACTOR_NATIONAL_ID = "ACTOR76X";
    private static final String ORIGINAL_NAME = "Mensajero atomico 76X";
    private static final String ORIGINAL_EMAIL = "courier76x@example.com";
    private static final String ORIGINAL_PHONE = "76300001";
    private static final String ORIGINAL_SCHEDULE = "Lunes a viernes, 08:00-17:00";
    private static final String ORIGINAL_WEIGHT = "25.50";

    private static final String BODY = """
            {"fullName":"Nombre nuevo 76X","email":"courier76x-nuevo@example.com",
             "phone":"76400001","schedule":"Sábado y domingo, 09:00-14:00",
             "maxPackageWeightKg":40.75}
            """;

    private static final String IDS_OF_THIS_TEST =
            "SELECT id FROM usuarios WHERE numero_documento IN ('" + COURIER_NATIONAL_ID + "', '" + ACTOR_NATIONAL_ID + "')";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private CourierRepository couriers;
    @Autowired private JwtService jwt;
    @Autowired private JdbcTemplate jdbc;
    @MockitoBean private AuditService audit;

    @AfterEach
    void cleanUpCommittedData() {
        jdbc.update("DELETE FROM auditorias WHERE usuario_id IN (" + IDS_OF_THIS_TEST
                + ") OR usuario_afectado_id IN (" + IDS_OF_THIS_TEST + ")");
        jdbc.update("DELETE FROM mensajeros WHERE usuario_id IN (" + IDS_OF_THIS_TEST + ")");
        jdbc.update("DELETE FROM usuarios WHERE numero_documento IN ('" + COURIER_NATIONAL_ID
                + "', '" + ACTOR_NATIONAL_ID + "')");

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM usuarios WHERE numero_documento IN ('"
                + COURIER_NATIONAL_ID + "', '" + ACTOR_NATIONAL_ID + "')", Integer.class)).isZero();
    }

    @Test
    void siLaAuditoriaFallaSeRevierteElCambioDelMensajero() throws Exception {
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber(ACTOR_NATIONAL_ID)
                .fullName("Actor 76X").email("actor76x@example.com").passwordHash("unused")
                .status(UserStatus.ACTIVE).role(roles.findByName("SUPER_USUARIO").orElseThrow()).build());
        var courierUser = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber(COURIER_NATIONAL_ID)
                .fullName(ORIGINAL_NAME).email(ORIGINAL_EMAIL).phone(ORIGINAL_PHONE)
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("MENSAJERO").orElseThrow()).build());
        var courier = couriers.saveAndFlush(Courier.builder().user(courierUser).schedule(ORIGINAL_SCHEDULE)
                .maxPackageWeightKg(new BigDecimal(ORIGINAL_WEIGHT)).build());
        String token = jwt.generateToken(new UserPrincipal(actor));
        doThrow(new IllegalStateException("audit down")).when(audit).logAction(any(), any(), any(), any());

        mvc.perform(put("/api/v1/couriers/" + courier.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"));

        // El 500 proviene de la auditoría, es decir, después del saveAndFlush del cambio.
        verify(audit, times(1)).logAction(any(), any(), any(), any());

        var reloaded = couriers.findById(courier.getId()).orElseThrow();
        var reloadedUser = users.findById(courierUser.getId()).orElseThrow();
        assertThat(reloadedUser.getFullName()).isEqualTo(ORIGINAL_NAME);
        assertThat(reloadedUser.getEmail()).isEqualTo(ORIGINAL_EMAIL);
        assertThat(reloadedUser.getPhone()).isEqualTo(ORIGINAL_PHONE);
        assertThat(reloaded.getSchedule()).isEqualTo(ORIGINAL_SCHEDULE);
        assertThat(reloaded.getMaxPackageWeightKg()).isEqualByComparingTo(ORIGINAL_WEIGHT);

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM auditorias WHERE usuario_id IN ("
                + IDS_OF_THIS_TEST + ") OR usuario_afectado_id IN (" + IDS_OF_THIS_TEST + ")",
                Integer.class)).isZero();
    }
}
