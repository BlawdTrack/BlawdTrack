package com.blawdgourmet.blawdtrack.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.auth.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

/** Restablecer la propia contraseña con la sesión iniciada: cualquier rol, solo para uno mismo. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OwnPasswordResetIntegrationTest {

    private static final String PATH = "/api/v1/auth/password-reset/request-own";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordResetTokenRepository tokens;
    @Autowired private JwtService jwt;
    @MockitoBean private EmailService emailService;

    private int documentSeed = 900000000;

    private User user(String role, String email) {
        return users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber(String.valueOf(documentSeed))
                .documentId(String.valueOf(documentSeed++))
                .fullName("Usuario " + role)
                .email(email)
                .passwordHash("unused")
                .status(UserStatus.ACTIVE)
                .role(roles.findByName(role).orElseThrow())
                .build());
    }

    private ResultActions requestOwn(User user, String body) throws Exception {
        var request = post(PATH).header("Authorization", "Bearer " + jwt.generateToken(new UserPrincipal(user)));
        if (body != null) {
            request.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        return mvc.perform(request);
    }

    private long tokensOf(User user) {
        return tokens.findAll().stream().filter(token -> token.getUser().getId().equals(user.getId())).count();
    }

    @ParameterizedTest
    @ValueSource(strings = {"SUPER_USUARIO", "ADMIN_VENTAS", "MENSAJERO"})
    void cadaRolRestableceSuPropiaContrasenaAlCorreoDeSuCuenta(String role) throws Exception {
        var user = user(role, "propio-" + role.toLowerCase() + "@example.com");

        requestOwn(user, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").isNotEmpty());

        verify(emailService).sendEmailWithToken(eq(user.getEmail()), anyString());
        assertThat(tokensOf(user)).isEqualTo(1);
    }

    @Test
    void ignoraCualquierCorreoQueLlegueEnElCuerpoYNuncaLoEnviaAOtraCuenta() throws Exception {
        var superUser = user("SUPER_USUARIO", "super-propio@example.com");
        var other = user("MENSAJERO", "otro-mensajero@example.com");

        requestOwn(superUser, "{\"email\":\"otro-mensajero@example.com\"}").andExpect(status().isOk());

        verify(emailService).sendEmailWithToken(eq("super-propio@example.com"), anyString());
        verify(emailService, never()).sendEmailWithToken(eq("otro-mensajero@example.com"), anyString());
        assertThat(tokensOf(other)).isZero();
        assertThat(tokensOf(superUser)).isEqualTo(1);
    }

    @Test
    void pedirloDeNuevoInvalidaElEnlaceAnterior() throws Exception {
        var user = user("MENSAJERO", "dos-veces@example.com");

        requestOwn(user, null).andExpect(status().isOk());
        requestOwn(user, null).andExpect(status().isOk());

        verify(emailService, times(2)).sendEmailWithToken(eq(user.getEmail()), anyString());
        assertThat(tokensOf(user)).isEqualTo(1);
    }

    @Test
    void sinSesionResponde401YNoEnviaNada() throws Exception {
        mvc.perform(post(PATH)).andExpect(status().isUnauthorized());

        verify(emailService, never()).sendEmailWithToken(anyString(), anyString());
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void siElCorreoNoSePuedeEnviarResponde503YNoDejaTokenGuardado() throws Exception {
        var user = user("MENSAJERO", "falla-smtp@example.com");
        doThrow(new MailSendException("SMTP caído")).when(emailService).sendEmailWithToken(anyString(), anyString());

        try {
            requestOwn(user, null)
                    .andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.code").value("CORREO_NO_ENVIADO"))
                    .andExpect(jsonPath("$.message").isNotEmpty());

            assertThat(tokensOf(user)).isZero();
        } finally {
            users.delete(user);
        }
    }
}
