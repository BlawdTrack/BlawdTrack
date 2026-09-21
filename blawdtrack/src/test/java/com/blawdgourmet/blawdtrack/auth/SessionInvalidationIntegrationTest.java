package com.blawdgourmet.blawdtrack.auth;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Task #75: cambiar el estado de la cuenta cierra las sesiones ya emitidas.
 * Usa el JwtService real y el filtro JWT real; el endpoint protegido es
 * {@code PUT /api/v1/couriers/{nationalId}} con un mensajero inexistente, que para un
 * Súper Usuario autenticado responde 404 sin escribir datos.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SessionInvalidationIntegrationTest {

    private static final String EMAIL = "sesion75@example.test";
    private static final String PASSWORD = "Sesion75-password!";
    private static final String PROTECTED_URL = "/api/v1/couriers/SESION75-INEXISTENTE";
    private static final String BODY = """
            {"fullName":"Nombre de prueba","email":"sesion75-nuevo@example.test",
             "phone":"75750075","schedule":"Lunes a viernes","maxPackageWeightKg":20}
            """;

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwt;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private EntityManager entityManager;
    @Value("${security.jwt.secret}") private String secret;

    private User createSuperUser() {
        return users.saveAndFlush(User.builder()
                .nationalId("SESION75").fullName("Súper Usuario de prueba")
                .email(EMAIL).phone("75757575")
                .passwordHash(passwordEncoder.encode(PASSWORD))
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(RoleName.SUPER_USER).orElseThrow()).build());
    }

    private void changeStatus(User user, UserStatus status) {
        user.changeStatus(status);
        users.saveAndFlush(user);
    }

    private User reload(User user) {
        entityManager.flush();
        entityManager.clear();
        return users.findById(user.getId()).orElseThrow();
    }

    /** Token sin el claim tokenVersion, como los emitidos antes de la Task #75. */
    private String tokenWithoutVersionClaim(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("id", user.getId())
                .claim("roles", "ROLE_" + RoleName.SUPER_USER)
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    private ResultActions callProtected(String token) throws Exception {
        return mvc.perform(put(PROTECTED_URL)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(BODY));
    }

    private ResultActions login(String bearerToken, String password) throws Exception {
        var request = post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"%s","password":"%s"}
                        """.formatted(EMAIL, password));
        if (bearerToken != null) {
            request.header("Authorization", "Bearer " + bearerToken);
        }
        return mvc.perform(request);
    }

    private void expectAccepted(ResultActions result) throws Exception {
        result.andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("COURIER_NOT_FOUND"));
    }

    private void expectSessionClosed(ResultActions result) throws Exception {
        result.andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("NO_AUTENTICADO"))
                .andExpect(jsonPath("$.message").value("Authentication is required to access this resource."))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void tokenVigenteDeUsuarioActivoNoRecibe401() throws Exception {
        User user = createSuperUser();
        String token = jwt.generateToken(new UserPrincipal(user));
        assertThat(jwt.extractTokenVersion(jwt.validateToken(token))).isZero();

        expectAccepted(callProtected(token));
    }

    @Test
    void elMismoTokenRecibe401TrasDesactivarLaCuenta() throws Exception {
        User user = createSuperUser();
        String token = jwt.generateToken(new UserPrincipal(user));
        expectAccepted(callProtected(token));

        changeStatus(user, UserStatus.INACTIVE);

        expectSessionClosed(callProtected(token));
    }

    @Test
    void reactivarLaCuentaNoRevivaElTokenViejoPeroUnLoginNuevoSiFunciona() throws Exception {
        User user = createSuperUser();
        String oldToken = jwt.generateToken(new UserPrincipal(user));

        changeStatus(user, UserStatus.INACTIVE);
        changeStatus(user, UserStatus.ACTIVE);

        User reloaded = reload(user);
        assertThat(reloaded.isActive()).isTrue();
        assertThat(reloaded.getTokenVersion()).isEqualTo(2);
        expectSessionClosed(callProtected(oldToken));

        // Login real: emite un token con la versión vigente.
        var result = login(null, PASSWORD).andExpect(status().isOk()).andReturn();
        String newToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
        assertThat(jwt.extractTokenVersion(jwt.validateToken(newToken))).isEqualTo(2);
        expectAccepted(callProtected(newToken));
        expectSessionClosed(callProtected(oldToken));
    }

    @Test
    void tokenSinClaimTokenVersionEsVersionCeroYSeCierraTrasUnCambioDeEstado() throws Exception {
        User user = createSuperUser();
        String legacyToken = tokenWithoutVersionClaim(user);
        assertThat(jwt.validateToken(legacyToken)).doesNotContainKey("tokenVersion");
        assertThat(reload(user).getTokenVersion()).isZero();

        expectAccepted(callProtected(legacyToken));

        User managed = reload(user);
        changeStatus(managed, UserStatus.INACTIVE);
        expectSessionClosed(callProtected(legacyToken));

        // Con la cuenta activa de nuevo solo la versión (2 en BD, 0 en el token) lo rechaza.
        changeStatus(managed, UserStatus.ACTIVE);
        assertThat(reload(managed).isActive()).isTrue();
        expectSessionClosed(callProtected(legacyToken));
    }

    @Test
    void changeStatusAlMismoValorNoIncrementaLaVersion() {
        User user = createSuperUser();
        assertThat(reload(user).getTokenVersion()).isZero();

        User managed = reload(user);
        managed.changeStatus(UserStatus.ACTIVE);
        users.saveAndFlush(managed);
        assertThat(reload(managed).getTokenVersion()).isZero();

        User active = reload(managed);
        active.changeStatus(UserStatus.INACTIVE);
        active.changeStatus(UserStatus.INACTIVE);
        users.saveAndFlush(active);
        User inactive = reload(active);
        assertThat(inactive.getStatus()).isEqualTo(UserStatus.INACTIVE);
        assertThat(inactive.getTokenVersion()).isEqualTo(1);
    }

    @Test
    void rutaPublicaConTokenInvalidadoSigueRespondiendoConNormalidad() throws Exception {
        User user = createSuperUser();
        String oldToken = jwt.generateToken(new UserPrincipal(user));
        changeStatus(user, UserStatus.INACTIVE);
        changeStatus(user, UserStatus.ACTIVE);
        expectSessionClosed(callProtected(oldToken));

        login(oldToken, PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.token").isNotEmpty());
        login(oldToken, "incorrecta")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_FAILED"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void tokenValidoDeUnIdQueNoExisteEnLaBaseDeDatosRecibe401() throws Exception {
        User ghost = User.builder().id(987654321L).nationalId("FANTASMA75")
                .fullName("Usuario inexistente").email("fantasma75@example.test")
                .role(roles.findByName(RoleName.SUPER_USER).orElseThrow()).build();
        assertThat(users.existsById(ghost.getId())).isFalse();
        String token = jwt.generateToken(new UserPrincipal(ghost));

        expectSessionClosed(callProtected(token));
    }

    @Test
    void usuarioInactivoPorSetStatusRecibe401SoloPorElEstado() throws Exception {
        User user = createSuperUser();
        String token = jwt.generateToken(new UserPrincipal(user));
        expectAccepted(callProtected(token));

        // setStatus no incrementa la versión: la versión del token sigue coincidiendo con la de la BD.
        user.setStatus(UserStatus.INACTIVE);
        users.saveAndFlush(user);
        User reloaded = reload(user);
        assertThat(reloaded.isActive()).isFalse();
        assertThat(reloaded.getTokenVersion()).isEqualTo(jwt.extractTokenVersion(jwt.validateToken(token)));

        expectSessionClosed(callProtected(token));
    }
}
