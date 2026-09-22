package com.blawdgourmet.blawdtrack.auth.service.impl;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.blawdgourmet.blawdtrack.auth.entity.PasswordHistory;
import com.blawdgourmet.blawdtrack.auth.entity.PasswordResetToken;
import com.blawdgourmet.blawdtrack.auth.exception.ContrasenaReutilizadaException;
import com.blawdgourmet.blawdtrack.auth.exception.TokenRestablecimientoInvalidoException;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordHistoryRepository;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.auth.service.PasswordResetResult;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

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
    private PasswordHistoryRepository passwordHistoryRepository;

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
                .documentType(DocumentType.CEDULA)
                .documentNumber("0101010101")
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
        assertThat(saved.isUsed()).isFalse();
        assertThat(saved.getExpirationDate()).isAfter(LocalDateTime.now());
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

    @Test
    void confirmPasswordReset_conTokenValido_guardaHistorialActualizaYConsumeToken() {
        User user = buildUser(UserStatus.ACTIVE);
        PasswordResetToken token = activeToken(user);
        when(passwordResetTokenRepository.findActivosParaActualizar(any())).thenReturn(List.of(token));
        when(passwordEncoder.matches("raw-token", "hash-token")).thenReturn(true);
        when(passwordEncoder.matches("Nueva123", "hash-no-real")).thenReturn(false);
        when(passwordHistoryRepository.findTop2ByUserOrderByCreatedAtDesc(user)).thenReturn(List.of());
        when(passwordEncoder.encode("Nueva123")).thenReturn("hash-nueva");

        passwordResetService.confirmPasswordReset("raw-token", "Nueva123");

        assertThat(user.getPasswordHash()).isEqualTo("hash-nueva");
        assertThat(token.isUsed()).isTrue();
        verify(passwordHistoryRepository).save(argThat(history ->
                history.getUser() == user && history.getPasswordHash().equals("hash-no-real")));
        verify(userRepository).save(user);
        verify(passwordResetTokenRepository).save(token);
    }

    @Test
    void confirmPasswordReset_conTokenInexistente_lanzaErrorUnificadoYSinPersistir() {
        when(passwordResetTokenRepository.findActivosParaActualizar(any())).thenReturn(List.of());

        assertThatThrownBy(() -> passwordResetService.confirmPasswordReset("desconocido", "Nueva123"))
                .isInstanceOf(TokenRestablecimientoInvalidoException.class)
                .hasMessage("El enlace de restablecimiento no es válido o ha expirado.");
        verifyNoInteractions(userRepository, passwordHistoryRepository);
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void confirmPasswordReset_conTokenExpirado_lanzaErrorUnificadoYSinPersistir() {
        when(passwordResetTokenRepository.findActivosParaActualizar(any())).thenReturn(List.of());

        assertThatThrownBy(() -> passwordResetService.confirmPasswordReset("expirado", "Nueva123"))
                .isInstanceOf(TokenRestablecimientoInvalidoException.class);
        verifyNoInteractions(userRepository, passwordHistoryRepository);
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void confirmPasswordReset_conTokenYaUsado_lanzaErrorUnificadoYSinPersistir() {
        when(passwordResetTokenRepository.findActivosParaActualizar(any())).thenReturn(List.of());

        assertThatThrownBy(() -> passwordResetService.confirmPasswordReset("usado", "Nueva123"))
                .isInstanceOf(TokenRestablecimientoInvalidoException.class);
        verifyNoInteractions(userRepository, passwordHistoryRepository);
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void confirmPasswordReset_contrasenaIgualALaActual_lanzaErrorYSinPersistir() {
        User user = buildUser(UserStatus.ACTIVE);
        PasswordResetToken token = activeToken(user);
        when(passwordResetTokenRepository.findActivosParaActualizar(any())).thenReturn(List.of(token));
        when(passwordEncoder.matches("raw-token", "hash-token")).thenReturn(true);
        when(passwordEncoder.matches("Nueva123", "hash-no-real")).thenReturn(true);

        assertThatThrownBy(() -> passwordResetService.confirmPasswordReset("raw-token", "Nueva123"))
                .isInstanceOf(ContrasenaReutilizadaException.class);
        verifyNoInteractions(userRepository, passwordHistoryRepository);
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void confirmPasswordReset_contrasenaEnLasDosUltimas_lanzaError() {
        User user = buildUser(UserStatus.ACTIVE);
        PasswordResetToken token = activeToken(user);
        when(passwordResetTokenRepository.findActivosParaActualizar(any())).thenReturn(List.of(token));
        when(passwordEncoder.matches("raw-token", "hash-token")).thenReturn(true);
        when(passwordEncoder.matches("Nueva123", "hash-no-real")).thenReturn(false);
        when(passwordHistoryRepository.findTop2ByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(
                PasswordHistory.builder().user(user).passwordHash("hash-anterior-1").build(),
                PasswordHistory.builder().user(user).passwordHash("hash-anterior-2").build()));
        when(passwordEncoder.matches("Nueva123", "hash-anterior-1")).thenReturn(false);
        when(passwordEncoder.matches("Nueva123", "hash-anterior-2")).thenReturn(true);

        assertThatThrownBy(() -> passwordResetService.confirmPasswordReset("raw-token", "Nueva123"))
                .isInstanceOf(ContrasenaReutilizadaException.class);
        verifyNoInteractions(userRepository);
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void confirmPasswordReset_contrasenaFueraDeLasTresUltimas_sePermite() {
        User user = buildUser(UserStatus.ACTIVE);
        PasswordResetToken token = activeToken(user);
        when(passwordResetTokenRepository.findActivosParaActualizar(any())).thenReturn(List.of(token));
        when(passwordEncoder.matches("raw-token", "hash-token")).thenReturn(true);
        when(passwordEncoder.matches("Nueva123", "hash-no-real")).thenReturn(false);
        when(passwordHistoryRepository.findTop2ByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(
                PasswordHistory.builder().user(user).passwordHash("hash-anterior-1").build(),
                PasswordHistory.builder().user(user).passwordHash("hash-anterior-2").build()));
        when(passwordEncoder.matches("Nueva123", "hash-anterior-1")).thenReturn(false);
        when(passwordEncoder.matches("Nueva123", "hash-anterior-2")).thenReturn(false);
        when(passwordEncoder.encode("Nueva123")).thenReturn("hash-nueva");

        passwordResetService.confirmPasswordReset("raw-token", "Nueva123");

        assertThat(user.getPasswordHash()).isEqualTo("hash-nueva");
        verify(userRepository).save(user);
        verify(passwordResetTokenRepository).save(token);
    }

    private PasswordResetToken activeToken(User user) {
        return PasswordResetToken.builder()
                .user(user)
                .tokenHash("hash-token")
                .expirationDate(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now())
                .used(false)
                .build();
    }
}
