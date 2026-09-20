package com.blawdgourmet.blawdtrack.auth;

import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.mail.autoconfigure.MailSenderAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.util.Assert;

/** Envio real, exclusivamente manual. No necesita MySQL ni un endpoint de prueba. */
@EnabledIfEnvironmentVariable(named = "BREVO_SEND_TEST", matches = "true")
@ActiveProfiles("brevo")
@SpringBootTest(classes = {EmailService.class, MailSenderAutoConfiguration.class},
        webEnvironment = SpringBootTest.WebEnvironment.NONE)
class BrevoEmailManualTest {
    @Autowired
    private EmailService service;

    @Test
    void sendsOneEmailToConfiguredTestMailbox() {
        String recipient = System.getenv("MAIL_TEST_TO");
        Assert.hasText(recipient, "Set MAIL_TEST_TO to your test mailbox");
        service.sendEmailWithToken(recipient, "blawdtrack-token-de-prueba-sin-validez");
    }
}
