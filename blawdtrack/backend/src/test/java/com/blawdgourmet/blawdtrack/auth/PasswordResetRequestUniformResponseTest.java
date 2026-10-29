package com.blawdgourmet.blawdtrack.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import com.blawdgourmet.blawdtrack.auth.service.impl.PasswordResetServiceImpl;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * "Recuperar contraseña" responde siempre igual (mismo código y mismo mensaje), exista o no la cuenta y funcione o no
 * el servidor de correo; el fallo de envío solo queda en el log, con la etiqueta del motivo.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PasswordResetRequestUniformResponseTest {

    private static final String EXISTING = "uniforme-existente@example.test";
    private static final String MISSING = "uniforme-inexistente@example.test";

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordEncoder passwordEncoder;
    @MockitoBean private EmailService emailService;

    @Test
    void respondeIgualConCuentaExistenteConFalloDeCorreoYConCuentaInexistente() throws Exception {
        createUser();
        doThrow(new MailSendException("smtp caido")).when(emailService).sendEmailWithToken(anyString(), anyString());

        var existing = mvc.perform(request(EXISTING)).andExpect(status().isOk()).andReturn().getResponse();
        var missing = mvc.perform(request(MISSING)).andExpect(status().isOk()).andReturn().getResponse();

        assertThat(existing.getStatus()).isEqualTo(missing.getStatus());
        assertThat(existing.getContentAsString()).isEqualTo(missing.getContentAsString());
    }

    @Test
    void elFalloDeEnvioQuedaSoloEnElLogConLaEtiquetaDelMotivo() throws Exception {
        createUser();
        var failure = new MailSendException("smtp caido",
                new MessagingException("525 5.7.1 Unauthorized IP address"));
        doThrow(failure).when(emailService).sendEmailWithToken(anyString(), anyString());
        var logger = (Logger) LoggerFactory.getLogger(PasswordResetServiceImpl.class);
        var appender = new ListAppender<ILoggingEvent>();
        appender.start();
        logger.addAppender(appender);
        try {
            String body = mvc.perform(request(EXISTING)).andExpect(status().isOk()).andReturn().getResponse()
                    .getContentAsString();

            assertThat(body).doesNotContain("IP_NOT_AUTHORIZED", "525");
            assertThat(appender.list).anySatisfy(event -> assertThat(event.getFormattedMessage())
                    .contains("IP_NOT_AUTHORIZED", "525").doesNotContain("Unauthorized IP address"));
        } finally {
            logger.detachAppender(appender);
        }
    }

    private org.springframework.test.web.servlet.RequestBuilder request(String email) {
        return post("/api/v1/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\"}".formatted(email));
    }

    private User createUser() {
        Role role = roles.save(Role.builder().name("UNIFORM_RESET_ROLE").build());
        return users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("UNIFORM-RESET")
                .fullName("Usuario uniforme")
                .email(EXISTING)
                .passwordHash(passwordEncoder.encode("Clave12345"))
                .status(UserStatus.ACTIVE)
                .role(role)
                .build());
    }
}
