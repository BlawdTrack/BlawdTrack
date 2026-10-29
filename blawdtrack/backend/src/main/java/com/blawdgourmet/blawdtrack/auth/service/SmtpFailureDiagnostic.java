package com.blawdgourmet.blawdtrack.auth.service;

import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.MessagingException;
import jakarta.mail.SendFailedException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.util.ArrayDeque;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.Locale;
import java.util.regex.Pattern;
import javax.net.ssl.SSLException;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;

/** Solo devuelve etiquetas y códigos; nunca mensajes del proveedor o credenciales. */
public final class SmtpFailureDiagnostic {
    private static final Pattern STATUS = Pattern.compile("^\\s*([245]\\d{2})(?:[ -]|$)");

    private static final String DEFAULT_REASON = "SMTP_ERROR";

    public static String describe(Throwable failure) {
        var pending = new ArrayDeque<Throwable>();
        var visited = Collections.newSetFromMap(new IdentityHashMap<Throwable, Boolean>());
        pending.add(failure);
        String reason = DEFAULT_REASON;
        String status = "no disponible";
        while (!pending.isEmpty() && visited.size() < 64) {
            Throwable current = pending.removeFirst();
            if (!visited.add(current)) continue;
            reason = classify(current, reason);
            status = statusOf(current, status);
            enqueueRelated(current, pending);
        }
        return reason + "; codigo SMTP=" + status;
    }

    /** Etiqueta que corresponde a este eslabon de la cadena; si no reconoce el tipo, conserva la anterior. */
    private static String classify(Throwable current, String reason) {
        if (current instanceof MessagingException mail && isUnauthorizedIp(mail)) {
            return "IP_NOT_AUTHORIZED: autorizar la IP de este servidor en Brevo "
                    + "(Seguridad > Direcciones IP autorizadas) o desactivar ese bloqueo";
        }
        if (current instanceof MailAuthenticationException || current instanceof AuthenticationFailedException) {
            return "AUTH_FAILED: verificar usuario y clave SMTP";
        }
        if (current instanceof UnknownHostException) {
            return "DNS_ERROR: no se pudo resolver el servidor SMTP";
        }
        if (current instanceof ConnectException) {
            return "CONNECTION_FAILED: revisar host, puerto y acceso de red";
        }
        if (current instanceof SocketTimeoutException) {
            return "TIMEOUT: el servidor SMTP no respondio a tiempo";
        }
        if (current instanceof SSLException) {
            return "TLS_ERROR: revisar certificados y configuracion TLS";
        }
        if (current instanceof SendFailedException && DEFAULT_REASON.equals(reason)) {
            return "SEND_REJECTED: revisar remitente, destinatario y restricciones del proveedor";
        }
        return reason;
    }

    /** Brevo rechaza con "525 5.7.1 Unauthorized IP address" cuando la cuenta limita las IP de envio. */
    private static boolean isUnauthorizedIp(MessagingException mail) {
        return mail.getMessage() != null && mail.getMessage().toLowerCase(Locale.ROOT).contains("unauthorized ip");
    }

    private static String statusOf(Throwable current, String status) {
        if (!(current instanceof MessagingException mail)) {
            return status;
        }
        var match = STATUS.matcher(mail.getMessage() == null ? "" : mail.getMessage());
        return match.find() ? match.group(1) : status;
    }

    private static void enqueueRelated(Throwable current, ArrayDeque<Throwable> pending) {
        if (current instanceof MessagingException mail && mail.getNextException() != null) {
            pending.add(mail.getNextException());
        }
        if (current instanceof MailSendException mail) {
            for (Exception nested : mail.getMessageExceptions()) pending.add(nested);
        }
        if (current.getCause() != null) pending.add(current.getCause());
    }

    private SmtpFailureDiagnostic() { }
}
