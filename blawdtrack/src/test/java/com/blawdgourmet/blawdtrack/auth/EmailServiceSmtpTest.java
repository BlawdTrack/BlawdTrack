package com.blawdgourmet.blawdtrack.auth;

import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.io.*;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

/** Comprueba el transporte SMTP real contra un receptor local, sin correos externos. */
class EmailServiceSmtpTest {
    @Test
    void deliversTemplateAndTokenOverLocalSmtp() throws Exception {
        try (var server = new ServerSocket(0, 1, InetAddress.getByName("127.0.0.1"));
             var executor = Executors.newSingleThreadExecutor()) {
            server.setSoTimeout(5000);
            var received = executor.submit(() -> receiveMessage(server));

            var sender = new JavaMailSenderImpl();
            sender.setHost("127.0.0.1");
            sender.setPort(server.getLocalPort());
            sender.getJavaMailProperties().setProperty("mail.smtp.connectiontimeout", "5000");
            sender.getJavaMailProperties().setProperty("mail.smtp.timeout", "5000");
            sender.getJavaMailProperties().setProperty("mail.smtp.writetimeout", "5000");
            var service = new EmailService(sender, "no-reply@blawdtrack.test",
                    "https://blawdtrack.test/recovery",
                    new ClassPathResource("templates/mail/email-with-token.html"));

            service.sendEmailWithToken("destinatario@example.test", "token-prueba+/=&ñ");
            Capture capture = received.get(10, TimeUnit.SECONDS);
            assertThat(capture.envelope()).contains("MAIL FROM:<no-reply@blawdtrack.test>",
                    "RCPT TO:<destinatario@example.test>");
            var message = new MimeMessage(Session.getInstance(new Properties()),
                    new ByteArrayInputStream(capture.message()));
            assertThat(message.getAllRecipients()).hasSize(1);
            assertThat(message.getAllRecipients()[0].toString()).isEqualTo("destinatario@example.test");
            assertThat(message.getSubject()).isEqualTo("BlawdTrack: enlace de recuperación");
            String link = "https://blawdtrack.test/recovery?token=token-prueba%2B%2F%3D%26%C3%B1";
            assertThat(body(message, "text/plain")).contains(link, "ignorá");
            String html = body(message, "text/html");
            assertThat(html).contains("href=\"" + link + "\"", "Abrir enlace de recuperación")
                    .doesNotContain("{{emailLink}}");

            // Evidencia reproducible con datos ficticios para inspeccionar el correo recibido.
            Path output = Path.of("target", "email-preview");
            Files.createDirectories(output);
            Files.write(output.resolve("correo-prueba.eml"), capture.message());
            Files.writeString(output.resolve("correo-prueba.html"), html, StandardCharsets.UTF_8);
        }
    }

    private record Capture(String envelope, byte[] message) { }

    /** Receptor minimo para una sola transaccion SMTP de prueba, sin autenticacion ni TLS. */
    private Capture receiveMessage(ServerSocket server) throws IOException {
        try (var socket = server.accept()) {
            socket.setSoTimeout(5000);
            var input = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            var output = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.US_ASCII));
            reply(output, "220 localhost test SMTP");
            var envelope = new StringBuilder();
            var data = new StringBuilder();
            String line;
            while ((line = input.readLine()) != null) {
                if (line.startsWith("EHLO ") || line.startsWith("HELO ")) {
                    reply(output, "250 localhost");
                } else if (line.startsWith("MAIL FROM:") || line.startsWith("RCPT TO:")) {
                    envelope.append(line).append('\n');
                    reply(output, "250 OK");
                } else if (line.equals("DATA")) {
                    reply(output, "354 End with dot");
                    while ((line = input.readLine()) != null && !line.equals(".")) {
                        data.append(line.startsWith("..") ? line.substring(1) : line).append("\r\n");
                    }
                    reply(output, "250 Accepted");
                } else if (line.equals("QUIT")) {
                    reply(output, "221 Bye");
                    break;
                } else {
                    throw new IOException("Unexpected SMTP command in test");
                }
            }
            return new Capture(envelope.toString(), data.toString().getBytes(StandardCharsets.UTF_8));
        }
    }

    private void reply(BufferedWriter output, String response) throws IOException {
        output.write(response + "\r\n");
        output.flush();
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
