package com.blawdgourmet.blawdtrack.couriers.service;

import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.MessagingException;
import jakarta.mail.SendFailedException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.util.ArrayDeque;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.regex.Pattern;
import javax.net.ssl.SSLException;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;

/** Solo devuelve etiquetas y códigos; nunca mensajes del proveedor o credenciales. */
final class SmtpFailureDiagnostic {
    private static final Pattern STATUS = Pattern.compile("^\\s*([245]\\d{2})(?:[ -]|$)");

    static String describe(Throwable failure) {
        var pending = new ArrayDeque<Throwable>();
        var visited = Collections.newSetFromMap(new IdentityHashMap<Throwable, Boolean>());
        pending.add(failure);
        String reason = "SMTP_ERROR";
        String status = "no disponible";
        while (!pending.isEmpty() && visited.size() < 64) {
            Throwable current = pending.removeFirst();
            if (!visited.add(current)) continue;
            if (current instanceof MailAuthenticationException || current instanceof AuthenticationFailedException) {
                reason = "AUTH_FAILED: verificar usuario y clave SMTP";
            } else if (current instanceof UnknownHostException) {
                reason = "DNS_ERROR: no se pudo resolver el servidor SMTP";
            } else if (current instanceof ConnectException) {
                reason = "CONNECTION_FAILED: revisar host, puerto y acceso de red";
            } else if (current instanceof SocketTimeoutException) {
                reason = "TIMEOUT: el servidor SMTP no respondio a tiempo";
            } else if (current instanceof SSLException) {
                reason = "TLS_ERROR: revisar certificados y configuracion TLS";
            } else if (current instanceof SendFailedException && reason.equals("SMTP_ERROR")) {
                reason = "SEND_REJECTED: revisar remitente, destinatario y restricciones del proveedor";
            }
            if (current instanceof MessagingException mail) {
                var match = STATUS.matcher(mail.getMessage() == null ? "" : mail.getMessage());
                if (match.find()) status = match.group(1);
                if (mail.getNextException() != null) pending.add(mail.getNextException());
            }
            if (current instanceof MailSendException mail) {
                for (Exception nested : mail.getMessageExceptions()) pending.add(nested);
            }
            if (current.getCause() != null) pending.add(current.getCause());
        }
        return reason + "; codigo SMTP=" + status;
    }

    private SmtpFailureDiagnostic() { }
}
