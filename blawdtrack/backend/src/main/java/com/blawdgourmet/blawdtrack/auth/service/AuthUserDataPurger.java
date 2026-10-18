package com.blawdgourmet.blawdtrack.auth.service;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.auth.repository.PasswordHistoryRepository;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.users.service.UserDataPurger;

import lombok.RequiredArgsConstructor;

/** Borra los tokens de recuperación y el historial de contraseñas de un usuario que se elimina. */
@Component
@RequiredArgsConstructor
public class AuthUserDataPurger implements UserDataPurger {

    private final PasswordResetTokenRepository resetTokens;
    private final PasswordHistoryRepository passwordHistory;

    @Override
    public void purgeFor(Long userId) {
        resetTokens.deleteByUserId(userId);
        passwordHistory.deleteByUserId(userId);
    }
}
