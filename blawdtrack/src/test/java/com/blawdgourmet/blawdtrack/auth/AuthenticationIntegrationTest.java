package com.blawdgourmet.blawdtrack.auth;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Role;
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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Task #53: endpoint, filtros, AuthenticationManager, BCrypt y repositorios reales con H2. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthenticationIntegrationTest {

    private static final String EMAIL = "task53@example.com";
    private static final String PASSWORD = "Task53-password!";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordEncoder passwordEncoder;
    @MockitoBean private JwtService jwtService;

    private User createUser(UserStatus status) {
        Role role = roles.save(Role.builder().name("TASK53_ROLE").build());
        return users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("TASK53")
                .fullName("Usuario de prueba")
                .email(EMAIL)
                .passwordHash(passwordEncoder.encode(PASSWORD))
                .status(status)
                .role(role)
                .build());
    }

    private ResultActions login(String email, String password) throws Exception {
        return mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"%s","password":"%s"}
                        """.formatted(email, password)));
    }

    @Test
    void credencialesValidasPermitenGenerarToken() throws Exception {
        User user = createUser(UserStatus.ACTIVE);
        assertThat(user.getPasswordHash()).isNotEqualTo(PASSWORD);
        when(jwtService.generateToken(any(UserPrincipal.class))).thenReturn("test-jwt");

        login(EMAIL, PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-jwt"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.role").value("TASK53_ROLE"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
        verify(jwtService).generateToken(any(UserPrincipal.class));
    }

    @Test
    void correoInexistenteYContrasenaIncorrectaDevuelvenElMismoError() throws Exception {
        createUser(UserStatus.ACTIVE);

        String wrongPassword = expectInvalidCredentials(login(EMAIL, "incorrecta"));
        String missingUser = expectInvalidCredentials(login("missing@example.com", PASSWORD));

        assertThat(missingUser).isEqualTo(wrongPassword);
        verifyNoInteractions(jwtService);
    }

    @Test
    void usuarioInactivoConContrasenaCorrectaRecibeMensajeDeCuentaInactiva() throws Exception {
        createUser(UserStatus.INACTIVE);

        login(EMAIL, PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_FAILED"))
                .andExpect(jsonPath("$.message").value("The account is inactive"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.token").doesNotExist());
        verifyNoInteractions(jwtService);
    }

    @Test
    void usuarioInactivoConContrasenaIncorrectaNoRevelaElEstadoDeLaCuenta() throws Exception {
        createUser(UserStatus.INACTIVE);

        expectInvalidCredentials(login(EMAIL, "incorrecta"));
        verifyNoInteractions(jwtService);
    }

    @Test
    void enviarElHashAlmacenadoComoContrasenaNoAutentica() throws Exception {
        User user = createUser(UserStatus.ACTIVE);

        expectInvalidCredentials(login(EMAIL, user.getPasswordHash()));
        verifyNoInteractions(jwtService);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{}",
            "{\"email\":\"task53@example.com\"}",
            "{\"email\":\"task53@example.com\",\"password\":\"\"}",
            "{\"email\":\"task53@example.com\",\"password\":\"   \"}",
            "{\"email\":\"invalid-email\",\"password\":\"password\"}",
            "{\"email\":\"\",\"password\":\"password\"}"
    })
    void entradasInvalidasSeRechazanSinGenerarToken(String body) throws Exception {
        mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(jwtService);
    }

    private String expectInvalidCredentials(ResultActions result) throws Exception {
        return result.andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_FAILED"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andReturn().getResponse().getContentAsString();
    }
}
