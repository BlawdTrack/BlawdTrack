package com.blawdgourmet.blawdtrack.auth.service.impl;

import com.blawdgourmet.blawdtrack.auth.entity.PasswordResetToken;
import com.blawdgourmet.blawdtrack.auth.entity.PasswordHistory;
import com.blawdgourmet.blawdtrack.auth.exception.ContrasenaReutilizadaException;
import com.blawdgourmet.blawdtrack.auth.exception.TokenRestablecimientoInvalidoException;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordHistoryRepository;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.auth.service.PasswordResetResult;
import com.blawdgourmet.blawdtrack.auth.service.PasswordResetService;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    /** Tiempo de vida del token de recuperación, en minutos. */
    private static final long TOKEN_EXPIRATION_MINUTES = 15L;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;

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

        String rawToken = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        PasswordResetToken token = PasswordResetToken.builder()
                .user(user.get())
                .tokenHash(passwordEncoder.encode(rawToken))
                .expirationDate(now.plusMinutes(TOKEN_EXPIRATION_MINUTES))
                .createdAt(now)
                .used(false)
                .build();

        passwordResetTokenRepository.save(token);

        return PasswordResetResult.generated(rawToken, user.get().getId());
    }

    @Override
    @Transactional
    public void confirmPasswordReset(String rawToken, String newPassword) {
        PasswordResetToken token = passwordResetTokenRepository
                .findActivosParaActualizar(LocalDateTime.now())
                .stream()
                .filter(candidate -> passwordEncoder.matches(rawToken, candidate.getTokenHash()))
                .findFirst()
                .orElseThrow(TokenRestablecimientoInvalidoException::new);

        User user = token.getUser();
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new ContrasenaReutilizadaException();
        }

        List<PasswordHistory> history = passwordHistoryRepository.findTop2ByUserOrderByCreatedAtDesc(user);
        if (history.stream().anyMatch(entry -> passwordEncoder.matches(newPassword, entry.getPasswordHash()))) {
            throw new ContrasenaReutilizadaException();
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
