package com.blawdgourmet.blawdtrack.users.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.blawdgourmet.blawdtrack.users.model.PasswordHistory;
import com.blawdgourmet.blawdtrack.users.model.PasswordResetToken;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.PasswordHistoryRepository;
import com.blawdgourmet.blawdtrack.users.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordHistoryRepository passwordHistoryRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private PasswordResetService service;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        service = new PasswordResetService(
                userRepository,
                passwordHistoryRepository,
                passwordResetTokenRepository,
                passwordEncoder);
    }

    @Test
    void generaTokenConExpiracionYLoPersisteHasheado() {
        User user = activeUserWithPassword("Actual#123");
        when(userRepository.findByEmail("cliente@correo.com")).thenReturn(Optional.of(user));

        var response = service.createToken(" CLIENTE@CORREO.COM ");

        assertNotNull(response.token());
        assertTrue(response.expiresAt().isAfter(Instant.now()));
        ArgumentCaptor<PasswordResetToken> captor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(captor.capture());
        assertNotEquals(response.token(), captor.getValue().getTokenHash());
        assertEquals(user, captor.getValue().getUser());
    }

    @Test
    void rechazaUnaContrasenaUsadaEnElHistorial() {
        User user = activeUserWithPassword("Actual#123");
        PasswordResetToken token = validTokenFor(user);
        when(passwordResetTokenRepository.findByTokenHashForUpdate(any())).thenReturn(Optional.of(token));
        when(passwordHistoryRepository.findTop3ByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(
                PasswordHistory.builder().user(user).passwordHash(passwordEncoder.encode("Anterior#123")).build()));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> service.updatePassword("token", "Anterior#123"));

        assertEquals("La nueva contraseña coincide con una de las últimas tres utilizadas", exception.getMessage());
        verify(userRepository, never()).save(any());
        assertNull(token.getUsedAt());
    }

    @Test
    void rechazaTokenExpiradoYNoActualizaLaContrasena() {
        User user = activeUserWithPassword("Actual#123");
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .tokenHash("hash")
                .expiresAt(Instant.now().minusSeconds(1))
                .build();
        when(passwordResetTokenRepository.findByTokenHashForUpdate(any())).thenReturn(Optional.of(token));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> service.updatePassword("token", "Nueva#456"));

        assertEquals("El token es inválido, expiró o ya fue utilizado", exception.getMessage());
        verify(userRepository, never()).save(any());
        verify(passwordResetTokenRepository, never()).save(any());
    }

    private User activeUserWithPassword(String password) {
        return User.builder()
                .email("cliente@correo.com")
                .passwordHash(passwordEncoder.encode(password))
                .status(UserStatus.ACTIVE)
                .build();
    }

    private PasswordResetToken validTokenFor(User user) {
        return PasswordResetToken.builder()
                .user(user)
                .tokenHash("hash")
                .expiresAt(Instant.now().plusSeconds(900))
                .build();
    }
}