package com.blawdgourmet.blawdtrack.auth;

import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Properties;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailServiceTest {
    private final JavaMailSender sender = mock(JavaMailSender.class);
    private EmailService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new EmailService(sender, "no-reply@blawdtrack.test",
                "https://blawdtrack.test/recovery",
                new ClassPathResource("templates/mail/email-with-token.html"));
    }

    private MimeMessage prepare() {
        var message = new MimeMessage(Session.getInstance(new Properties()));
        when(sender.createMimeMessage()).thenReturn(message);
        return message;
    }

    @Test
    void sendsMultipartEmailWithEncodedToken() throws Exception {
        var message = prepare();
        service.sendEmailWithToken("usuario@example.com", "abc+/=&?ñ");
        verify(sender).send(message);
        message.saveChanges();
        assertThat(message.getAllRecipients()).hasSize(1);
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo("usuario@example.com");
        assertThat(message.getFrom()[0].toString()).isEqualTo("no-reply@blawdtrack.test");
        assertThat(message.getSubject()).isEqualTo("BlawdTrack: enlace de recuperación");
        String link = "https://blawdtrack.test/recovery?token=abc%2B%2F%3D%26%3F%C3%B1";
        assertThat(body(message, "text/plain")).contains(link, "ignorá");
        assertThat(body(message, "text/html")).contains("href=\"" + link + "\"")
                .doesNotContain("{{", "abc+/=&?ñ");
    }

    @Test
    void rejectsEmptyRecipientOrToken() {
        assertThatThrownBy(() -> service.sendEmailWithToken("usuario@example.com", " "))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.sendEmailWithToken(" ", "token"))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(sender);
    }

    @Test
    void propagatesSmtpFailure() {
        var message = prepare();
        var failure = new MailSendException("SMTP unavailable");
        doThrow(failure).when(sender).send(message);
        assertThatThrownBy(() -> service.sendEmailWithToken("usuario@example.com", "token")).isSameAs(failure);
    }

    @Test
    void rejectsInvalidLinkUrl() {
        for (String url : new String[]{"javascript:alert(1)", "/reset", "https://example.com/reset?token=old",
                "https://example.com/reset#fragment", "https://user:password@example.com/reset"}) {
            assertThatThrownBy(() -> new EmailService(sender, "a@example.com", url,
                    new ClassPathResource("templates/mail/email-with-token.html")))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void sendsWelcomeWithCredentialsAndEscapesHtml() throws Exception {
        var message = prepare();
        service.sendCourierWelcome("courier@example.com", "Ana <script>", "Ab12<&strong>!");
        verify(sender).send(message);
        message.saveChanges();
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo("courier@example.com");
        assertThat(message.getSubject()).isEqualTo("BlawdTrack: bienvenida y credenciales de acceso");
        assertThat(body(message, "text/plain")).contains("courier@example.com", "Ab12<&strong>!");
        assertThat(body(message, "text/html")).contains("Ana &lt;script&gt;", "Ab12&lt;&amp;strong&gt;!")
                .doesNotContain("<script>", "Ab12<&strong>!");
    }

    private String body(Part part, String type) throws Exception {
        if (part.isMimeType(type)) return (String) part.getContent();
        if (part.getContent() instanceof Multipart multipart) {
            for (int i = 0; i < multipart.getCount(); i++) {
                String found = body(multipart.getBodyPart(i), type);
                if (found != null) return found;
            }
        }
        return null;
    }
}
