package com.blawdgourmet.blawdtrack.auth.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;

import com.blawdgourmet.blawdtrack.users.service.AdminRegisteredEvent;

@ExtendWith(MockitoExtension.class)
class AdminWelcomeListenerTest {

    private static final AdminRegisteredEvent EVENT =
            new AdminRegisteredEvent(7L, "admin@example.com", "Ana Admin", "Temp-Pass-123!");

    @Mock private EmailService emailService;
    @InjectMocks private AdminWelcomeListener listener;

    @Test
    void sendsTheWelcomeEmailWithTheTemporaryPassword() {
        listener.onRegistered(EVENT);

        verify(emailService).sendAdminWelcome("admin@example.com", "Ana Admin", "Temp-Pass-123!");
    }

    @Test
    void keepsTheAccountWhenTheEmailFails() {
        doThrow(new MailSendException("SMTP down"))
                .when(emailService).sendAdminWelcome("admin@example.com", "Ana Admin", "Temp-Pass-123!");

        assertThatCode(() -> listener.onRegistered(EVENT)).doesNotThrowAnyException();
    }
}
