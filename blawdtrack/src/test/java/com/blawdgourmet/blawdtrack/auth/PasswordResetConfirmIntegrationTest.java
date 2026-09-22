package com.blawdgourmet.blawdtrack.auth;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.entity.PasswordHistory;
import com.blawdgourmet.blawdtrack.auth.entity.PasswordResetToken;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordHistoryRepository;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.service.PasswordResetResult;
import com.blawdgourmet.blawdtrack.auth.service.PasswordResetService;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PasswordResetConfirmIntegrationTest {

    private static final String EMAIL = "password-reset@example.com";
    private static final String OLD_PASSWORD = "OldPass123";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private PasswordResetService passwordResetService;
    @Autowired private PasswordResetTokenRepository tokens;
    @Autowired private PasswordHistoryRepository history;
    @MockitoBean private JwtService jwtService;

    @Test
    void confirmarRestablecimiento_actualizaLoginGuardaHistorialYConsumeToken() throws Exception {
                createUser();
        PasswordResetResult result = passwordResetService.requestPasswordReset(EMAIL);
        when(jwtService.generateToken(any())).thenReturn("test-jwt");

        confirm(result.rawToken(), "NewPass123")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Contraseña actualizada correctamente."));

        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"NewPass123\"}".formatted(EMAIL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-jwt"));
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(EMAIL, OLD_PASSWORD)))
                .andExpect(status().isUnauthorized());

        User updated = users.findByEmail(EMAIL).orElseThrow();
        assertThat(history.findTop2ByUserOrderByCreatedAtDesc(updated)).hasSize(1);
        assertThat(tokens.findAll()).singleElement().satisfies(token -> assertThat(token.isUsed()).isTrue());
    }

    @Test
    void tokenInexistenteDevuelveErrorGenerico() throws Exception {
        confirm("token-inexistente", "NewPass123")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TOKEN_INVALIDO"))
                .andExpect(jsonPath("$.message").value("El enlace de restablecimiento no es válido o ha expirado."));
    }

    @Test
    void reutilizarTokenFallaIgualQueTokenInexistente() throws Exception {
        createUser();
        PasswordResetResult result = passwordResetService.requestPasswordReset(EMAIL);

        confirm(result.rawToken(), "NewPass123").andExpect(status().isOk());
        confirm(result.rawToken(), "Another123")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TOKEN_INVALIDO"))
                .andExpect(jsonPath("$.message").value("El enlace de restablecimiento no es válido o ha expirado."));
    }

    @Test
    void tokenExpiradoDevuelveErrorGenerico() throws Exception {
        User user = createUser();
        tokens.saveAndFlush(PasswordResetToken.builder()
                .user(user)
                .tokenHash(passwordEncoder.encode("expired-token"))
                .expirationDate(LocalDateTime.now().minusMinutes(1))
                .createdAt(LocalDateTime.now().minusMinutes(2))
                .used(false)
                .build());

        confirm("expired-token", "NewPass123")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TOKEN_INVALIDO"));
    }

    @Test
    void nuevaContrasenaConFormatoInvalidoDevuelveValidacion() throws Exception {
        confirm("token", "short")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void reutilizarContrasenaDevuelveErrorEspecifico() throws Exception {
        createUser();
        PasswordResetResult result = passwordResetService.requestPasswordReset(EMAIL);

        confirm(result.rawToken(), OLD_PASSWORD)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("CONTRASENA_REUTILIZADA"))
                .andExpect(jsonPath("$.message")
                        .value("La nueva contraseña no puede coincidir con las últimas contraseñas utilizadas."));
    }

    @Test
    void reutilizarUnaDeLasDosUltimasContrasenasDevuelveErrorEspecifico() throws Exception {
        User user = createUser();
        history.save(PasswordHistory.builder()
                .user(user)
                .passwordHash(passwordEncoder.encode("Previous123"))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build());
        PasswordResetResult result = passwordResetService.requestPasswordReset(EMAIL);

        confirm(result.rawToken(), "Previous123")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("CONTRASENA_REUTILIZADA"));
    }

    private User createUser() {
        Role role = roles.save(Role.builder().name("PASSWORD_RESET_ROLE").build());
        return users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("PASSWORD-RESET")
                .fullName("Usuario de restablecimiento")
                .email(EMAIL)
                .passwordHash(passwordEncoder.encode(OLD_PASSWORD))
                .status(UserStatus.ACTIVE)
                .role(role)
                .build());
    }

    private org.springframework.test.web.servlet.ResultActions confirm(String token, String password) throws Exception {
        return mvc.perform(post("/api/v1/auth/password-reset/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"%s\",\"newPassword\":\"%s\"}".formatted(token, password)));
    }
}
