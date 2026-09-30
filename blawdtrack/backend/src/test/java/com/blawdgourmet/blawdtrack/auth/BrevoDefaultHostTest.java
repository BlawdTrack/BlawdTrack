package com.blawdgourmet.blawdtrack.auth;

import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.mail.autoconfigure.MailSenderAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Sin {@code MAIL_HOST}, el perfil {@code brevo} usa el nombre que sí cubre el certificado del relé SMTP
 * y mantiene activa la verificación de identidad del servidor.
 */
@ActiveProfiles("brevo")
@SpringBootTest(classes = {EmailService.class, MailSenderAutoConfiguration.class},
        webEnvironment = SpringBootTest.WebEnvironment.NONE,
        properties = {"MAIL_USERNAME=test-login", "MAIL_PASSWORD=test-key",
                "MAIL_FROM=sender@example.test", "MAIL_LINK_URL=https://example.test/recovery"})
class BrevoDefaultHostTest {
    @Autowired
    private JavaMailSenderImpl sender;

    @Test
    void usaPorDefectoElNombreDelCertificadoYVerificaLaIdentidadDelServidor() {
        assertThat(sender.getHost()).isEqualTo("smtp-relay.sendinblue.com");
        assertThat(sender.getJavaMailProperties()).containsEntry("mail.smtp.ssl.checkserveridentity", "true");
    }
}
