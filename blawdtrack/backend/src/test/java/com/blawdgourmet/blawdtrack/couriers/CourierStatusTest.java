package com.blawdgourmet.blawdtrack.couriers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.couriers.service.CourierWorkloadPort;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import jakarta.persistence.EntityManager;

/** HU-004: cambio de estado de acceso (cierre de sesión) e historial de modificaciones. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CourierStatusTest {

    private static final String DEACTIVATE = "{\"status\":\"INACTIVE\"}";
    private static final String ACTIVATE = "{\"status\":\"ACTIVE\"}";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private CourierRepository couriers;
    @Autowired private AuditLogRepository auditLogs;
    @Autowired private JwtService jwt;
    @Autowired private EntityManager entityManager;
    @MockitoBean private CourierWorkloadPort workload;

    private User courierUser;
    private Courier courier;

    @BeforeEach
    void courier() {
        courierUser = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440444").fullName("Mensajero HU004").email("courier-hu004@example.com")
                .phone("70444044").passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("MENSAJERO").orElseThrow()).build());
        courier = couriers.saveAndFlush(Courier.builder().user(courierUser).schedule("Lunes a viernes")
                .maxPackageWeightKg(new BigDecimal("20.00")).build());
    }

    private String tokenOf(User user) {
        return jwt.generateToken(new UserPrincipal(user));
    }

    private String superUserToken() {
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440445").fullName("Super HU004").email("super-hu004@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("SUPER_USUARIO").orElseThrow()).build());
        return tokenOf(actor);
    }

    private ResultActions changeStatus(String token, String body) throws Exception {
        return mvc.perform(patch("/api/v1/couriers/" + courier.getId() + "/status")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private List<AuditLog> records(String action) {
        entityManager.flush();
        entityManager.clear();
        return auditLogs.findAll().stream()
                .filter(log -> log.getUsuarioAfectado() != null
                        && courierUser.getId().equals(log.getUsuarioAfectado().getId())
                        && action.equals(log.getAction()))
                .toList();
    }

    @Test
    void desactivarCierraLaSesionActivaDelMensajeroDeInmediato() throws Exception {
        String courierToken = tokenOf(courierUser);
        // Sesión vigente: autenticado pero sin permiso para listar (403, no 401).
        mvc.perform(get("/api/v1/couriers").header("Authorization", "Bearer " + courierToken))
                .andExpect(status().isForbidden());

        changeStatus(superUserToken(), DEACTIVATE)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        assertThat(users.findById(courierUser.getId()).orElseThrow().getTokenVersion()).isEqualTo(1);
        mvc.perform(get("/api/v1/couriers").header("Authorization", "Bearer " + courierToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void reactivarTambienInvalidaLosTokensAnterioresYRegistraLaAccion() throws Exception {
        String superToken = superUserToken();
        changeStatus(superToken, DEACTIVATE).andExpect(status().isOk());
        String tokenWhileInactive = tokenOf(users.findById(courierUser.getId()).orElseThrow());

        changeStatus(superToken, ACTIVATE)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        mvc.perform(get("/api/v1/couriers").header("Authorization", "Bearer " + tokenWhileInactive))
                .andExpect(status().isUnauthorized());
        assertThat(records("ACTIVAR_MENSAJERO")).hasSize(1);
        assertThat(records("DESACTIVAR_MENSAJERO")).hasSize(1);
    }

    @Test
    void elCambioDeEstadoQuedaEnElHistorialConFechaHoraYCampo() throws Exception {
        changeStatus(superUserToken(), DEACTIVATE).andExpect(status().isOk());

        var log = records("DESACTIVAR_MENSAJERO").get(0);
        assertThat(log.getTimestamp()).isNotNull();
        assertThat(log.getDetails()).isEqualTo("status");
        assertThat(log.getActor().getEmail()).isEqualTo("super-hu004@example.com");
    }

    @Test
    void repetirElMismoEstadoNoCierraSesionNiRegistraNada() throws Exception {
        changeStatus(superUserToken(), ACTIVATE).andExpect(status().isOk());

        assertThat(users.findById(courierUser.getId()).orElseThrow().getTokenVersion()).isZero();
        assertThat(records("ACTIVAR_MENSAJERO")).isEmpty();
    }

    @Test
    void conAsignacionesActivasNoSeDesactivaNiSeCierraLaSesion() throws Exception {
        when(workload.hasActiveAssignments(courier.getId())).thenReturn(true);

        changeStatus(superUserToken(), DEACTIVATE)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("COURIER_HAS_ACTIVE_ASSIGNMENTS"));

        var stored = users.findById(courierUser.getId()).orElseThrow();
        assertThat(stored.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(stored.getTokenVersion()).isZero();
        assertThat(records("DESACTIVAR_MENSAJERO")).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN_VENTAS", "MENSAJERO"})
    void otrosRolesNoPuedenCambiarElEstado(String role) throws Exception {
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440446").fullName("Otro rol").email("otro-hu004@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow()).build());

        changeStatus(tokenOf(actor), DEACTIVATE).andExpect(status().isForbidden());
    }

    @Test
    void estadoInvalidoSeRechaza() throws Exception {
        String superToken = superUserToken();

        changeStatus(superToken, "{}").andExpect(status().isBadRequest());
        changeStatus(superToken, "{\"status\":\"BORRADO\"}").andExpect(status().isBadRequest());
    }

    private ResultActions deactivate(String token) throws Exception {
        return mvc.perform(patch("/api/v1/couriers/" + courier.getId() + "/deactivate")
                .header("Authorization", "Bearer " + token));
    }

    @Test
    void deactivateDesactivaCierraLaSesionYConservaAlMensajeroYSuPerfil() throws Exception {
        String courierToken = tokenOf(courierUser);

        deactivate(superUserToken())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        mvc.perform(get("/api/v1/couriers").header("Authorization", "Bearer " + courierToken))
                .andExpect(status().isUnauthorized());
        // La desactivación es lógica: el usuario y su perfil de mensajero se conservan.
        assertThat(users.findById(courierUser.getId())).isPresent();
        assertThat(couriers.findById(courier.getId())).isPresent();
        assertThat(records("DESACTIVAR_MENSAJERO")).hasSize(1);
    }

    @Test
    void deactivateConAsignacionesActivasResponde409YNoDesactiva() throws Exception {
        when(workload.hasActiveAssignments(courier.getId())).thenReturn(true);

        deactivate(superUserToken())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("COURIER_HAS_ACTIVE_ASSIGNMENTS"));

        assertThat(users.findById(courierUser.getId()).orElseThrow().getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN_VENTAS", "MENSAJERO"})
    void deactivateSoloLoPuedeEjecutarElSuperUsuario(String role) throws Exception {
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440448").fullName("Sin permiso").email("sinpermiso-hu005@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow()).build());

        deactivate(tokenOf(actor)).andExpect(status().isForbidden());

        assertThat(users.findById(courierUser.getId()).orElseThrow().getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void elHistorialListaLosCambiosMasRecientesPrimeroConFechaHoraYAutor() throws Exception {
        String superToken = superUserToken();
        mvc.perform(put("/api/v1/couriers/" + courier.getId())
                        .header("Authorization", "Bearer " + superToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Mensajero HU004 editado","email":"courier-hu004@example.com",
                                 "phone":"70444044","schedule":"Lunes a viernes","maxPackageWeightKg":20.00}
                                """))
                .andExpect(status().isOk());
        changeStatus(superToken, DEACTIVATE).andExpect(status().isOk());

        mvc.perform(get("/api/v1/couriers/" + courier.getId() + "/history")
                        .header("Authorization", "Bearer " + superToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].action").value("DESACTIVAR_MENSAJERO"))
                .andExpect(jsonPath("$[0].details").value("status"))
                .andExpect(jsonPath("$[0].timestamp").isNotEmpty())
                .andExpect(jsonPath("$[0].actorName").value("Super HU004"))
                .andExpect(jsonPath("$[1].action").value("ACTUALIZAR_MENSAJERO"))
                .andExpect(jsonPath("$[1].details").value("fullName"));
    }

    @Test
    void elHistorialSoloLoPuedeVerElSuperUsuario() throws Exception {
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440447").fullName("Admin ventas").email("ventas-hu004@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("ADMIN_VENTAS").orElseThrow()).build());

        mvc.perform(get("/api/v1/couriers/" + courier.getId() + "/history")
                        .header("Authorization", "Bearer " + tokenOf(actor)))
                .andExpect(status().isForbidden());
    }

    @Test
    void laAuditoriaDeDesactivacionesSeConservaAunqueElMensajeroSeReactive() throws Exception {
        String superToken = superUserToken();
        changeStatus(superToken, DEACTIVATE).andExpect(status().isOk());
        changeStatus(superToken, ACTIVATE).andExpect(status().isOk());
        assertThat(users.findById(courierUser.getId()).orElseThrow().getStatus()).isEqualTo(UserStatus.ACTIVE);

        mvc.perform(get("/api/v1/couriers/deactivations").header("Authorization", "Bearer " + superToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].courierName").value(courierUser.getFullName()))
                .andExpect(jsonPath("$[0].documentNumber").value(courierUser.getDocumentNumber()))
                .andExpect(jsonPath("$[0].actorName").value("Super HU004"))
                .andExpect(jsonPath("$[0].timestamp").isNotEmpty());
        assertThat(records("DESACTIVAR_MENSAJERO")).hasSize(1);
    }

    @Test
    void laAuditoriaDeDesactivacionesListaCadaDesactivacionDeLaMasRecienteALaMasAntigua() throws Exception {
        String superToken = superUserToken();
        changeStatus(superToken, DEACTIVATE).andExpect(status().isOk());
        changeStatus(superToken, ACTIVATE).andExpect(status().isOk());
        changeStatus(superToken, DEACTIVATE).andExpect(status().isOk());

        mvc.perform(get("/api/v1/couriers/deactivations").header("Authorization", "Bearer " + superToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void laAuditoriaDeDesactivacionesSoloLaPuedeVerElSuperUsuario() throws Exception {
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440448").fullName("Admin ventas 2").email("ventas2-hu004@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("ADMIN_VENTAS").orElseThrow()).build());

        mvc.perform(get("/api/v1/couriers/deactivations").header("Authorization", "Bearer " + tokenOf(actor)))
                .andExpect(status().isForbidden());
    }

    @Test
    void elHistorialGeneralJuntaLosCambiosDeTodosLosMensajerosConElMensajeroAfectado() throws Exception {
        var otherUser = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440449").fullName("Otro Mensajero HU004").email("otro-hu004@example.com")
                .phone("70444049").passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("MENSAJERO").orElseThrow()).build());
        var other = couriers.saveAndFlush(Courier.builder().user(otherUser).schedule("Lunes a viernes")
                .maxPackageWeightKg(new BigDecimal("15.00")).build());
        String superToken = superUserToken();
        changeStatus(superToken, DEACTIVATE).andExpect(status().isOk());
        mvc.perform(patch("/api/v1/couriers/" + other.getId() + "/status")
                        .header("Authorization", "Bearer " + superToken)
                        .contentType(MediaType.APPLICATION_JSON).content(DEACTIVATE))
                .andExpect(status().isOk());

        mvc.perform(get("/api/v1/couriers/history").header("Authorization", "Bearer " + superToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].courierName").value("Otro Mensajero HU004"))
                .andExpect(jsonPath("$[0].documentNumber").value("704440449"))
                .andExpect(jsonPath("$[0].action").value("DESACTIVAR_MENSAJERO"))
                .andExpect(jsonPath("$[0].actorName").value("Super HU004"))
                .andExpect(jsonPath("$[0].timestamp").isNotEmpty())
                .andExpect(jsonPath("$[1].courierName").value(courierUser.getFullName()));
    }

    @Test
    void elHistorialPorMensajeroSigueMostrandoSoloLosCambiosDeEseMensajero() throws Exception {
        var otherUser = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440450").fullName("Otro Mensajero 2 HU004").email("otro2-hu004@example.com")
                .phone("70444050").passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("MENSAJERO").orElseThrow()).build());
        var other = couriers.saveAndFlush(Courier.builder().user(otherUser).schedule("Lunes a viernes")
                .maxPackageWeightKg(new BigDecimal("15.00")).build());
        String superToken = superUserToken();
        changeStatus(superToken, DEACTIVATE).andExpect(status().isOk());
        mvc.perform(patch("/api/v1/couriers/" + other.getId() + "/status")
                        .header("Authorization", "Bearer " + superToken)
                        .contentType(MediaType.APPLICATION_JSON).content(DEACTIVATE))
                .andExpect(status().isOk());

        mvc.perform(get("/api/v1/couriers/" + courier.getId() + "/history")
                        .header("Authorization", "Bearer " + superToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void elHistorialGeneralSoloLoPuedeVerElSuperUsuario() throws Exception {
        var actor = users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA)
                .documentNumber("704440451").fullName("Admin ventas 3").email("ventas3-hu004@example.com")
                .passwordHash("unused").status(UserStatus.ACTIVE)
                .role(roles.findByName("ADMIN_VENTAS").orElseThrow()).build());

        mvc.perform(get("/api/v1/couriers/history").header("Authorization", "Bearer " + tokenOf(actor)))
                .andExpect(status().isForbidden());
    }
}
