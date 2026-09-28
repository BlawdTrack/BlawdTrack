package com.blawdgourmet.blawdtrack.couriers.service;

import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.MessagingException;
import jakarta.mail.SendFailedException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.util.Map;
import javax.net.ssl.SSLException;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import static org.assertj.core.api.Assertions.assertThat;

class SmtpFailureDiagnosticTest {
    @Test
    void muestraCodigoSinExponerRespuestaDelProveedor() {
        var failure = new MailAuthenticationException("secreto-SMTP",
                new AuthenticationFailedException("535 clave-SMTP usuario@example.com"));
        assertThat(SmtpFailureDiagnostic.describe(failure)).contains("AUTH_FAILED", "535")
                .doesNotContain("secreto-SMTP", "clave-SMTP", "usuario@example.com");
    }

    @Test
    void clasificaErroresDeRedAnidados() {
        var cases = Map.of(new ConnectException("private"), "CONNECTION_FAILED",
                new UnknownHostException("private"), "DNS_ERROR",
                new SocketTimeoutException("private"), "TIMEOUT",
                new SSLException("private"), "TLS_ERROR");
        cases.forEach((cause, expected) -> {
            var mail = new MessagingException("private", cause);
            assertThat(SmtpFailureDiagnostic.describe(new MailSendException("private", mail)))
                    .contains(expected).doesNotContain("private");
        });
    }

    @Test
    void detectaRechazoEnMensajesFallidos() {
        var failure = new MailSendException(Map.of("mensaje-privado",
                new SendFailedException("550 remitente-privado rechazado")));
        assertThat(SmtpFailureDiagnostic.describe(failure)).contains("SEND_REJECTED", "550")
                .doesNotContain("privado");
    }
}
