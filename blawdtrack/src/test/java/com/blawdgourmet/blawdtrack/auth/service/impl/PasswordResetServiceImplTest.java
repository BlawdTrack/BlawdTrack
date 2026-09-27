package com.blawdgourmet.blawdtrack.auth.service.impl;

import com.blawdgourmet.blawdtrack.auth.entity.PasswordResetToken;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.auth.service.PasswordResetResult;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias (Task #62) para
 * {@link PasswordResetServiceImpl#requestPasswordReset(String)}, mockeando
 * {@link UserRepository} y {@link PasswordResetTokenRepository} para no
 * depender de base de datos.
 */
@ExtendWith(MockitoExtension.class)
class PasswordResetServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetServiceImpl passwordResetService;

    private User buildUser(UserStatus status) {
        Role role = Role.builder()
                .name("ADMIN")
                .permissions(Collections.emptySet())
                .build();

        return User.builder()
                .id(1L)
                .documentId("0101010101")
                .fullName("Genesis Silesky")
                .email("genesis@blawdtrack.com")
                .passwordHash("hash-no-real")
                .status(status)
                .role(role)
                .build();
    }

    @Test
    void requestPasswordReset_conCorreoExistenteYActivo_generaYPersisteElToken() {
        User user = buildUser(UserStatus.ACTIVE);
        when(userRepository.findByEmail("genesis@blawdtrack.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(any())).thenReturn("hash-simulado");

        PasswordResetResult result = passwordResetService.requestPasswordReset("genesis@blawdtrack.com");

        assertThat(result.tokenGenerated()).isTrue();
        assertThat(result.rawToken()).isNotBlank();
        assertThat(result.userId()).isEqualTo(1L);

        ArgumentCaptor<PasswordResetToken> captor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(captor.capture());

        PasswordResetToken saved = captor.getValue();
        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.getTokenHash()).isEqualTo("hash-simulado");
        assertThat(saved.isUsado()).isFalse();
        assertThat(saved.getFechaExpiracion()).isAfter(LocalDateTime.now());
        // El valor plano nunca se guarda: solo se persiste su hash.
        assertThat(saved.getTokenHash()).isNotEqualTo(result.rawToken());
    }

    @Test
    void requestPasswordReset_conCorreoInexistente_noPersisteNada() {
        when(userRepository.findByEmail("no-existe@blawdtrack.com")).thenReturn(Optional.empty());

        PasswordResetResult result = passwordResetService.requestPasswordReset("no-existe@blawdtrack.com");

        assertThat(result.tokenGenerated()).isFalse();
        assertThat(result.rawToken()).isNull();
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void requestPasswordReset_conCuentaInactiva_noPersisteNada() {
        User user = buildUser(UserStatus.INACTIVE);
        when(userRepository.findByEmail("genesis@blawdtrack.com")).thenReturn(Optional.of(user));

        PasswordResetResult result = passwordResetService.requestPasswordReset("genesis@blawdtrack.com");

        assertThat(result.tokenGenerated()).isFalse();
        verify(passwordResetTokenRepository, never()).save(any());
    }
}
