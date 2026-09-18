package com.blawdgourmet.blawdtrack.audit.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.blawdgourmet.blawdtrack.audit.dto.LoginRequest;
import com.blawdgourmet.blawdtrack.audit.dto.LoginResponse;
import com.blawdgourmet.blawdtrack.audit.exception.InactiveAccountException;
import com.blawdgourmet.blawdtrack.audit.exception.InvalidCredentialsException;
import com.blawdgourmet.blawdtrack.security.JwtService;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    void loginShouldRejectUnknownEmail() {
        when(userRepository.findByEmail("noexiste@blawdtrack.com")).thenReturn(Optional.empty());

        InvalidCredentialsException ex = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(new LoginRequest("noexiste@blawdtrack.com", "123456"))
        );

        assertEquals("El correo electronico o la contrasena son incorrectos.", ex.getMessage());
    }

    @Test
    void loginShouldRejectWrongPassword() {
        User user = buildUser("alice@blawdtrack.com", "correctPassword", UserStatus.ACTIVE);
        when(userRepository.findByEmail("alice@blawdtrack.com")).thenReturn(Optional.of(user));

        InvalidCredentialsException ex = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(new LoginRequest("alice@blawdtrack.com", "wrongPassword"))
        );

        assertEquals("El correo electronico o la contrasena son incorrectos.", ex.getMessage());
    }

    @Test
    void loginShouldRejectInactiveAccount() {
        User user = buildUser("inactive@blawdtrack.com", "correctPassword", UserStatus.INACTIVE);
        when(userRepository.findByEmail("inactive@blawdtrack.com")).thenReturn(Optional.of(user));

        InactiveAccountException ex = assertThrows(
                InactiveAccountException.class,
                () -> authService.login(new LoginRequest("inactive@blawdtrack.com", "correctPassword"))
        );

        assertEquals("La cuenta se encuentra inactiva. Contacte al Super Usuario para reactivarla.", ex.getMessage());
    }

    @Test
    void loginShouldGenerateTokenForActiveUser() {
        User user = buildUser("active@blawdtrack.com", "correctPassword", UserStatus.ACTIVE);
        when(userRepository.findByEmail("active@blawdtrack.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token-123");
        when(jwtService.getExpirationMs()).thenReturn(3_600_000L);

        LoginResponse response = authService.login(new LoginRequest("active@blawdtrack.com", "correctPassword"));

        assertNotNull(response);
        assertEquals("jwt-token-123", response.token());
        assertEquals("Bearer", response.tokenType());
        assertEquals(3600L, response.expiresInSeconds());
        assertEquals("active@blawdtrack.com", response.user().email());
        assertEquals("SUPER_USUARIO", response.user().role());
    }

    private User buildUser(String email, String rawPassword, UserStatus status) {
        Role role = Role.builder()
                .id(1L)
                .name("SUPER_USUARIO")
                .description("Super Usuario")
                .build();

        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User();
        user.setId(10L);
        user.setNationalId("123456789");
        user.setFullName("Usuario Activo");
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);
        user.setPhone("55512345");
        user.setStatus(status);
        user.setRole(role);
        return user;
    }
}
