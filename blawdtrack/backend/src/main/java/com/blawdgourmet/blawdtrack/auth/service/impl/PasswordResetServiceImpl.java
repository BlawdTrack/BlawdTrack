package com.blawdgourmet.blawdtrack.auth.service.impl;

import com.blawdgourmet.blawdtrack.auth.entity.PasswordResetToken;
import com.blawdgourmet.blawdtrack.auth.entity.PasswordHistory;
import com.blawdgourmet.blawdtrack.auth.exception.PasswordReusedException;
import com.blawdgourmet.blawdtrack.auth.exception.InvalidResetTokenException;
import com.blawdgourmet.blawdtrack.auth.exception.PasswordResetEmailException;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordHistoryRepository;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.auth.service.EmailService;
import com.blawdgourmet.blawdtrack.auth.service.PasswordResetResult;
import com.blawdgourmet.blawdtrack.auth.service.PasswordResetService;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    /** Tiempo de vida del token de recuperación, en minutos. */
    private static final long TOKEN_EXPIRATION_MINUTES = 15L;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * Reutiliza {@link UserRepository#findByEmail(String)} (Task #52) para
     * ubicar al usuario y {@link User#isActive()} (Task #52) para validar que
     * la cuenta no esté inactiva; ninguna de las dos reglas se reimplementa
     * aquí.
     */
    @Override
    @Transactional
    public PasswordResetResult requestPasswordReset(String email) {
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty() || !user.get().isActive()) {
            return PasswordResetResult.notGenerated();
        }

        String rawToken = issueToken(user.get());
        sendResetEmail(user.get().getEmail(), rawToken);

        return PasswordResetResult.generated(rawToken, user.get().getId());
    }

    @Override
    @Transactional
    public void requestOwnPasswordReset(Long userId) {
        User user = userRepository.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new AccessDeniedException("La cuenta no existe o está inactiva."));

        // Los enlaces anteriores dejan de valer: solo el más reciente restablece la contraseña.
        passwordResetTokenRepository.deleteByUserId(user.getId());
        String rawToken = issueToken(user);

        try {
            emailService.sendEmailWithToken(user.getEmail(), rawToken);
        } catch (MailException ex) {
            log.error("No se pudo enviar el correo de restablecimiento al usuario {}", user.getId(), ex);
            // Revierte la transacción: sin correo no queda un token que nadie pueda usar.
            throw new PasswordResetEmailException(ex);
        }
    }

    /** Genera y guarda un token nuevo (solo su hash) y devuelve su valor en texto plano. */
    private String issueToken(User user) {
        String rawToken = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(user)
                .tokenHash(passwordEncoder.encode(rawToken))
                .expirationDate(now.plusMinutes(TOKEN_EXPIRATION_MINUTES))
                .createdAt(now)
                .used(false)
                .build());

        return rawToken;
    }

    /**
     * Un fallo SMTP no se propaga: el endpoint responde siempre igual para no
     * revelar qué correos existen. El token queda vigente hasta que expire.
     */
    private void sendResetEmail(String email, String rawToken) {
        try {
            emailService.sendEmailWithToken(email, rawToken);
        } catch (MailException ex) {
            log.warn("Password reset email could not be sent", ex);
        }
    }

    @Override
    @Transactional
    public void confirmPasswordReset(String rawToken, String newPassword) {
        PasswordResetToken token = passwordResetTokenRepository
                .findActiveForUpdate(LocalDateTime.now())
                .stream()
                .filter(candidate -> passwordEncoder.matches(rawToken, candidate.getTokenHash()))
                .findFirst()
                .orElseThrow(InvalidResetTokenException::new);

        User user = token.getUser();
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new PasswordReusedException();
        }

        List<PasswordHistory> history = passwordHistoryRepository.findTop2ByUserOrderByCreatedAtDesc(user);
        if (history.stream().anyMatch(entry -> passwordEncoder.matches(newPassword, entry.getPasswordHash()))) {
            throw new PasswordReusedException();
        }

        passwordHistoryRepository.save(PasswordHistory.builder()
                .user(user)
                .passwordHash(user.getPasswordHash())
                .createdAt(LocalDateTime.now())
                .build());
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }
}
