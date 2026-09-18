package com.blawdgourmet.blawdtrack.audit.service;

import com.blawdgourmet.blawdtrack.audit.dto.LoginRequest;
import com.blawdgourmet.blawdtrack.audit.dto.LoginResponse;
import com.blawdgourmet.blawdtrack.audit.dto.UserSummaryResponse;
import com.blawdgourmet.blawdtrack.audit.exception.InactiveAccountException;
import com.blawdgourmet.blawdtrack.audit.exception.InvalidCredentialsException;
import com.blawdgourmet.blawdtrack.security.JwtService;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for the login process (HU-001 / CU-001).
 *
 * Rules applied:
 * - The error message for incorrect credentials is always generic,
 *   without indicating whether the email or the password is the wrong field.
 * - A user with INACTIVE status cannot log in, even if the password is correct.
 * - Passwords are never compared or stored in plain text; they are validated
 *   against the stored hash using PasswordEncoder (BCrypt).
 */
@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE =
            "El correo electronico o la contrasena son incorrectos.";
    private static final String INACTIVE_ACCOUNT_MESSAGE =
            "La cuenta se encuentra inactiva. Contacte al Super Usuario para reactivarla.";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest loginRequest) {
        String normalizedEmail = loginRequest.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (!passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }

        if (!user.isActive()) {
            throw new InactiveAccountException(INACTIVE_ACCOUNT_MESSAGE);
        }

        String token = jwtService.generateToken(user);

        UserSummaryResponse userSummary = new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName()
        );

        long expiresInSeconds = jwtService.getExpirationMs() / 1000;

        return new LoginResponse(token, "Bearer", expiresInSeconds, userSummary);
    }
}
