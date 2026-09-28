package com.blawdgourmet.blawdtrack.auth;

import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.mail.autoconfigure.MailSenderAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("brevo")
@SpringBootTest(classes = {EmailService.class, MailSenderAutoConfiguration.class},
        webEnvironment = SpringBootTest.WebEnvironment.NONE,
        properties = {"MAIL_HOST=smtp-relay.brevo.com", "MAIL_USERNAME=test-login", "MAIL_PASSWORD=test-key",
                "MAIL_FROM=sender@example.test", "MAIL_LINK_URL=https://example.test/recovery"})
class BrevoConfigurationTest {
    @Autowired
    private JavaMailSenderImpl sender;

    @Autowired
    private EmailService service;

    @Test
    void loadsBrevoProfileWithoutSendingMail() {
        assertThat(service).isNotNull();
        assertThat(sender.getHost()).isEqualTo("smtp-relay.brevo.com");
        assertThat(sender.getPort()).isEqualTo(587);
        assertThat(sender.getUsername()).isEqualTo("test-login");
        assertThat(sender.getJavaMailProperties())
                .containsEntry("mail.smtp.auth", "true")
                .containsEntry("mail.smtp.starttls.enable", "true")
                .containsEntry("mail.smtp.starttls.required", "true")
                .containsEntry("mail.smtp.ssl.checkserveridentity", "true");
    }
}
