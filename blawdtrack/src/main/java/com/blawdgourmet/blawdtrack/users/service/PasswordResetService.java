package com.blawdgourmet.blawdtrack.users.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.users.dto.PasswordResetTokenResponse;
import com.blawdgourmet.blawdtrack.users.model.PasswordHistory;
import com.blawdgourmet.blawdtrack.users.model.PasswordResetToken;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.PasswordHistoryRepository;
import com.blawdgourmet.blawdtrack.users.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@Service
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final long tokenTtlMinutes;

    public PasswordResetService(UserRepository userRepository,
                                PasswordHistoryRepository passwordHistoryRepository,
                                PasswordResetTokenRepository passwordResetTokenRepository,
                                PasswordEncoder passwordEncoder) {
        this(userRepository, passwordHistoryRepository, passwordResetTokenRepository, passwordEncoder, 15);
    }

    @Autowired
    public PasswordResetService(UserRepository userRepository,
                                PasswordHistoryRepository passwordHistoryRepository,
                                PasswordResetTokenRepository passwordResetTokenRepository,
                                PasswordEncoder passwordEncoder,
                                @Value("${password-reset.token-ttl-minutes:15}") long tokenTtlMinutes) {
        this.userRepository = userRepository;
        this.passwordHistoryRepository = passwordHistoryRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenTtlMinutes = tokenTtlMinutes;
    }

    @Transactional
    public PasswordResetTokenResponse createToken(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .filter(User::isActive)
                .orElseThrow(() -> new IllegalArgumentException("No existe un usuario activo con ese correo"));

        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        Instant expiresAt = Instant.now().plusSeconds(tokenTtlMinutes * 60);

        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(user)
                .tokenHash(hashToken(rawToken))
                .expiresAt(expiresAt)
                .build());

        return new PasswordResetTokenResponse(rawToken, expiresAt);
    }

    @Transactional
    public void updatePassword(String rawToken, String newPassword) {
        Instant now = Instant.now();
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHashForUpdate(hashToken(rawToken))
                .filter(token -> token.isValidAt(now))
                .orElseThrow(() -> new IllegalArgumentException("El token es inválido, expiró o ya fue utilizado"));

        User user = resetToken.getUser();
        if (!user.isActive()) {
            throw new IllegalArgumentException("El usuario no está activo");
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())
                || passwordHistoryRepository.findTop3ByUserOrderByCreatedAtDesc(user).stream()
                .anyMatch(history -> passwordEncoder.matches(newPassword, history.getPasswordHash()))) {
            throw new IllegalArgumentException("La nueva contraseña coincide con una de las últimas tres utilizadas");
        }

        passwordHistoryRepository.save(PasswordHistory.builder()
                .user(user)
                .passwordHash(user.getPasswordHash())
                .createdAt(now)
                .build());
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetToken.setUsedAt(now);
        passwordResetTokenRepository.save(resetToken);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String hashToken(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                hash.append(String.format("%02x", value));
            }
            return hash.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("No se pudo generar el hash del token", exception);
        }
    }
}