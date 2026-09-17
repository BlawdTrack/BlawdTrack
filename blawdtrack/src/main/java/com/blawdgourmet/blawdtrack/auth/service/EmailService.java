package com.blawdgourmet.blawdtrack.auth.service;

import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;

/** Task #63: envio por SMTP del enlace con el token recibido. */
@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final String from;
    private final String linkUrl;
    private final String template;

    public EmailService(JavaMailSender mailSender,
            @Value("${app.mail.from}") String from,
            @Value("${app.mail.link-url}") String linkUrl,
            @Value("classpath:templates/mail/email-with-token.html") Resource template) throws IOException {
        URI uri = URI.create(linkUrl);
        Assert.isTrue(("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                && uri.getHost() != null && uri.getUserInfo() == null
                && uri.getRawQuery() == null && uri.getRawFragment() == null,
                "Email link URL must be an absolute HTTP(S) URL without credentials, query or fragment");
        Assert.hasText(from, "Mail sender is required");
        this.mailSender = mailSender;
        this.from = from;
        this.linkUrl = linkUrl;
        this.template = template.getContentAsString(StandardCharsets.UTF_8);
    }

    /**
     * Recibe el correo de destino y un token generado por el llamador.
     * Un fallo SMTP se propaga como MailException; no se informa exito ni se reintenta aqui.
     */
    public void sendEmailWithToken(String recipient, String token) {
        Assert.hasText(recipient, "Recipient is required");
        Assert.hasText(token, "Token is required");

        // Una variable URI codifica tambien '+', '/', '&' y '=' dentro del token.
        String link = UriComponentsBuilder.fromUriString(linkUrl)
                .queryParam("token", "{token}").encode().buildAndExpand(token).toUriString();
        String text = "Enlace de recuperación de BlawdTrack\n\n"
                + "Para continuar con tu solicitud, abrí este enlace:\n" + link
                + "\n\nSi no solicitaste este cambio, ignorá este correo.";
        String html = template.replace("{{emailLink}}", HtmlUtils.htmlEscape(link));
        var message = mailSender.createMimeMessage();
        try {
            var helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setValidateAddresses(true);
            helper.setFrom(from);
            helper.setTo(recipient);
            helper.setSubject("BlawdTrack: enlace de recuperación");
            helper.setText(text, html);
        } catch (MessagingException ex) {
            throw new MailPreparationException("Could not prepare email", ex);
        }
        mailSender.send(message);
    }
}
