package com.blawdgourmet.blawdtrack.users;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserDetailsServiceImpl;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.PermissionCode;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserPermissionRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import jakarta.persistence.EntityManager;

/** HU-009: permisos individuales por usuario, alcance por rol y restablecimiento de predeterminados. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserPermissionIntegrationTest {

    private static final String PATH = "/api/v1/users/{documentType}/{documentNumber}/permissions";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private UserPermissionRepository userPermissions;
    @Autowired private AuditLogRepository audits;
    @Autowired private JwtService jwt;
    @Autowired private UserDetailsServiceImpl userDetailsService;
    @Autowired private EntityManager entityManager;

    private User courier;
    private User salesAdmin;
    private String superToken;

    @BeforeEach
    void setUp() {
        courier = user(RoleName.COURIER, "800000001", "courier-hu009@example.test");
        salesAdmin = user(RoleName.SALES_ADMIN, "800000002", "admin-hu009@example.test");
        superToken = "Bearer " + jwt.generateToken(new UserPrincipal(
                user(RoleName.SUPER_USER, "800000003", "super-hu009@example.test")));
    }

    private User user(String roleName, String documentNumber, String email) {
        return users.saveAndFlush(User.builder().documentType(DocumentType.CEDULA).documentNumber(documentNumber)
                .fullName("Usuario " + roleName).email(email).passwordHash("hash").status(UserStatus.ACTIVE)
                .role(roles.findByName(roleName).orElseThrow()).build());
    }

    private ResultActions permissions(String documentNumber) throws Exception {
        return mvc.perform(get(PATH, "CEDULA", documentNumber).header("Authorization", superToken));
    }

    private ResultActions replace(String documentNumber, String... codes) throws Exception {
        String body = "{\"permissionCodes\":[" + String.join(",",
                java.util.Arrays.stream(codes).map(code -> "\"" + code + "\"").toList()) + "]}";
        return mvc.perform(put(PATH, "CEDULA", documentNumber).header("Authorization", superToken)
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions reset(String documentNumber) throws Exception {
        return mvc.perform(delete(PATH, "CEDULA", documentNumber).header("Authorization", superToken));
    }

    private List<String> authoritiesOf(User user) {
        entityManager.flush();
        entityManager.clear();
        return userDetailsService.loadUserByUsername(user.getEmail()).getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();
    }

    private List<AuditLog> audit(String action, User affected) {
        entityManager.flush();
        entityManager.clear();
        return audits.findAll().stream()
                .filter(log -> action.equals(log.getAction()) && log.getUsuarioAfectado() != null
                        && affected.getId().equals(log.getUsuarioAfectado().getId()))
                .toList();
    }

    @Test
    void consultaLaMatrizConLosPermisosPredeterminadosDelRolYSuAlcance() throws Exception {
        permissions("800000001")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value(RoleName.COURIER))
                .andExpect(jsonPath("$.editable").value(true))
                .andExpect(jsonPath("$.customized").value(false))
                .andExpect(jsonPath("$.rolePermissions", containsInAnyOrder(
                        PermissionCode.PACKAGE_VIEW_ASSIGNED, PermissionCode.PACKAGE_UPDATE_STATUS,
                        PermissionCode.TRIP_COST_REGISTER)))
                .andExpect(jsonPath("$.effectivePermissions", containsInAnyOrder(
                        PermissionCode.PACKAGE_VIEW_ASSIGNED, PermissionCode.PACKAGE_UPDATE_STATUS,
                        PermissionCode.TRIP_COST_REGISTER)))
                .andExpect(jsonPath("$.allowedPermissions.length()").value(3));
    }

    @Test
    void revocarUnPermisoSeAplicaEnLaSiguienteSolicitudYQuedaAuditado() throws Exception {
        assertThat(authoritiesOf(courier)).contains(PermissionCode.PACKAGE_UPDATE_STATUS);

        replace("800000001", PermissionCode.PACKAGE_VIEW_ASSIGNED, PermissionCode.TRIP_COST_REGISTER)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customized").value(true))
                .andExpect(jsonPath("$.effectivePermissions", containsInAnyOrder(
                        PermissionCode.PACKAGE_VIEW_ASSIGNED, PermissionCode.TRIP_COST_REGISTER)))
                // El rol no cambia: la excepción es individual.
                .andExpect(jsonPath("$.rolePermissions.length()").value(3));

        assertThat(authoritiesOf(courier)).doesNotContain(PermissionCode.PACKAGE_UPDATE_STATUS)
                .contains("ROLE_" + RoleName.COURIER, PermissionCode.PACKAGE_VIEW_ASSIGNED);
        assertThat(audit("ACTUALIZAR_PERMISOS_USUARIO", courier)).singleElement().satisfies(log -> {
            assertThat(log.getTimestamp()).isNotNull();
            assertThat(log.getActor().getEmail()).isEqualTo("super-hu009@example.test");
            assertThat(log.getDetails()).contains("revoked=[" + PermissionCode.PACKAGE_UPDATE_STATUS + "]");
        });
    }

    @Test
    void concederUnPermisoDelAlcanceQueElRolNoTieneSeAplicaAlUsuario() throws Exception {
        // El Super Usuario retiró el permiso al rol; para un usuario concreto se vuelve a conceder.
        var role = roles.findByName(RoleName.COURIER).orElseThrow();
        role.getPermissions().removeIf(permission -> permission.getCode().equals(PermissionCode.TRIP_COST_REGISTER));
        roles.saveAndFlush(role);

        replace("800000001", PermissionCode.PACKAGE_VIEW_ASSIGNED, PermissionCode.PACKAGE_UPDATE_STATUS,
                PermissionCode.TRIP_COST_REGISTER)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rolePermissions.length()").value(2))
                .andExpect(jsonPath("$.effectivePermissions.length()").value(3));

        assertThat(authoritiesOf(courier)).contains(PermissionCode.TRIP_COST_REGISTER);
        assertThat(audit("ACTUALIZAR_PERMISOS_USUARIO", courier)).singleElement()
                .satisfies(log -> assertThat(log.getDetails()).contains("granted=[" + PermissionCode.TRIP_COST_REGISTER + "]"));
    }

    @ParameterizedTest
    @ValueSource(strings = {PermissionCode.PACKAGE_DELETE, PermissionCode.USER_CREATE, PermissionCode.ROLE_ASSIGN})
    void unMensajeroNoPuedeObtenerPermisosRestringidosQueNoLeCorresponden(String restricted) throws Exception {
        replace("800000001", PermissionCode.PACKAGE_VIEW_ASSIGNED, restricted)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ROLE_PERMISSIONS_ERROR"));

        assertThat(userPermissions.findByUserId(courier.getId())).isEmpty();
        assertThat(audit("ACTUALIZAR_PERMISOS_USUARIO", courier)).isEmpty();
    }

    @Test
    void unAdministradorDeVentasNoPuedeObtenerPermisosDeMensajeroNiDeGestionDeUsuarios() throws Exception {
        replace("800000002", PermissionCode.PACKAGE_VIEW, PermissionCode.PACKAGE_UPDATE_STATUS)
                .andExpect(status().isForbidden());
        replace("800000002", PermissionCode.USER_CREATE).andExpect(status().isForbidden());

        assertThat(userPermissions.findByUserId(salesAdmin.getId())).isEmpty();
    }

    @Test
    void permisoInexistenteSeRechazaConBadRequest() throws Exception {
        replace("800000001", "PERMISO_QUE_NO_EXISTE").andExpect(status().isBadRequest());
        assertThat(userPermissions.findByUserId(courier.getId())).isEmpty();
    }

    @Test
    void usuarioInexistenteResponde404ConElMensajeUsuarioNoExistente() throws Exception {
        long audits = this.audits.count();

        permissions("899999999").andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("USUARIO_NO_EXISTENTE"))
                .andExpect(jsonPath("$.message").value("Usuario no existente"));
        replace("899999999", PermissionCode.PACKAGE_VIEW).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Usuario no existente"));
        reset("899999999").andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Usuario no existente"));

        assertThat(this.audits.count()).isEqualTo(audits);
    }

    @Test
    void elUsuarioSeEncuentraPorDocumentoSinImportarSuFormatoNiSuRol() throws Exception {
        permissions("8-0000-0001").andExpect(status().isOk())
                .andExpect(jsonPath("$.documentNumber").value("800000001"));
        permissions("800000002").andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value(RoleName.SALES_ADMIN));
    }

    @Test
    void documentoConFormatoInvalidoSeRechaza() throws Exception {
        mvc.perform(get(PATH, "CEDULA", "abc").header("Authorization", superToken))
                .andExpect(status().isBadRequest());
        mvc.perform(get(PATH, "NIT", "123456789").header("Authorization", superToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void elPermisoDeUnSuperUsuarioNoSeModifica() throws Exception {
        permissions("800000003").andExpect(status().isOk())
                .andExpect(jsonPath("$.editable").value(false))
                .andExpect(jsonPath("$.allowedPermissions").isEmpty());
        replace("800000003", PermissionCode.PACKAGE_VIEW).andExpect(status().isForbidden());
        reset("800000003").andExpect(status().isForbidden());
    }

    @Test
    void restablecerVuelveALosPermisosPredeterminadosDelRolYQuedaAuditado() throws Exception {
        replace("800000001", PermissionCode.TRIP_COST_REGISTER).andExpect(status().isOk());
        assertThat(authoritiesOf(courier)).doesNotContain(PermissionCode.PACKAGE_UPDATE_STATUS);

        reset("800000001")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customized").value(false))
                .andExpect(jsonPath("$.effectivePermissions", containsInAnyOrder(
                        PermissionCode.PACKAGE_VIEW_ASSIGNED, PermissionCode.PACKAGE_UPDATE_STATUS,
                        PermissionCode.TRIP_COST_REGISTER)));

        assertThat(authoritiesOf(courier)).contains(PermissionCode.PACKAGE_UPDATE_STATUS,
                PermissionCode.PACKAGE_VIEW_ASSIGNED, PermissionCode.TRIP_COST_REGISTER);
        assertThat(userPermissions.findByUserId(courier.getId())).isEmpty();
        assertThat(audit("RESTABLECER_PERMISOS_USUARIO", courier)).hasSize(1);

        // Restablecer de nuevo no cambia nada, por lo que no genera otro registro.
        reset("800000001").andExpect(status().isOk());
        assertThat(audit("RESTABLECER_PERMISOS_USUARIO", courier)).hasSize(1);
    }

    @Test
    void repetirElMismoConjuntoNoGeneraOtraAuditoria() throws Exception {
        replace("800000001", PermissionCode.PACKAGE_VIEW_ASSIGNED).andExpect(status().isOk());
        replace("800000001", PermissionCode.PACKAGE_VIEW_ASSIGNED).andExpect(status().isOk());

        assertThat(audit("ACTUALIZAR_PERMISOS_USUARIO", courier)).hasSize(1);
        assertThat(userPermissions.findByUserId(courier.getId())).hasSize(2);
    }

    @Test
    void enviarLosPermisosDelRolNoDejaExcepcionesGuardadas() throws Exception {
        replace("800000001", PermissionCode.PACKAGE_VIEW_ASSIGNED).andExpect(status().isOk());

        replace("800000001", PermissionCode.PACKAGE_VIEW_ASSIGNED, PermissionCode.PACKAGE_UPDATE_STATUS,
                PermissionCode.TRIP_COST_REGISTER)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customized").value(false));

        assertThat(userPermissions.findByUserId(courier.getId())).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {RoleName.SALES_ADMIN, RoleName.COURIER})
    void soloElSuperUsuarioPuedeConsultarModificarORestablecer(String role) throws Exception {
        User actor = user(role, "800000009", "actor-hu009@example.test");
        String token = "Bearer " + jwt.generateToken(new UserPrincipal(actor));

        mvc.perform(get(PATH, "CEDULA", "800000001").header("Authorization", token))
                .andExpect(status().isForbidden());
        mvc.perform(put(PATH, "CEDULA", "800000001").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"permissionCodes\":[]}"))
                .andExpect(status().isForbidden());
        mvc.perform(delete(PATH, "CEDULA", "800000001").header("Authorization", token))
                .andExpect(status().isForbidden());

        assertThat(userPermissions.findByUserId(courier.getId())).isEmpty();
    }

    @Test
    void sinTokenResponde401() throws Exception {
        mvc.perform(get(PATH, "CEDULA", "800000001")).andExpect(status().isUnauthorized());
    }
}
