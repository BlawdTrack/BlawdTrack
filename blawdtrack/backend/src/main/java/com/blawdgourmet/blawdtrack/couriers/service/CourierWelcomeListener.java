package com.blawdgourmet.blawdtrack.couriers.service;

import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Envía el correo de bienvenida con la contraseña temporal cuando un mensajero se registra (HU-003).
 * Escucha {@link CourierRegisteredEvent} <b>después del commit</b>: si el registro se revierte no sale
 * ningún correo, y si el correo falla la cuenta ya creada se conserva (solo se registra el error, sin
 * credenciales).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CourierWelcomeListener {
    private final EmailService emailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onRegistered(CourierRegisteredEvent event) {
        try {
            emailService.sendCourierWelcome(event.email, event.fullName, event.temporaryPassword);
        } catch (MailException ex) {
            // La cuenta ya se confirmó. No devolver un falso error de registro ni registrar credenciales.
            log.error("No se pudo enviar el correo de bienvenida del usuario {}. {}",
                    event.userId, SmtpFailureDiagnostic.describe(ex));
        }
    }
}
