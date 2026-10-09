package com.blawdgourmet.blawdtrack.auth.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

/** El Super Usuario sembrado conserva la contraseña de desarrollo solo cuando la propiedad lo pide. */
class DataSeederTest {

    private static final String EMAIL = "superadmin@blawdgourmet.com";
    private static final String DEFAULT_PASSWORD = "ultra_gorGon_1!";

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private RoleRepository roles;
    private UserRepository users;
    private User superUser;

    @BeforeEach
    void setUp() {
        roles = mock(RoleRepository.class);
        users = mock(UserRepository.class);
        superUser = User.builder()
                .email(EMAIL)
                .fullName("Super Usuario")
                .passwordHash(encoder.encode("otra-contrasena-1"))
                .build();
        when(users.findByEmail(EMAIL)).thenReturn(Optional.of(superUser));
    }

    private DataSeeder seeder(boolean resetPassword) {
        return new DataSeeder(roles, users, encoder, resetPassword);
    }

    @Test
    void conLaPropiedadActivaRestauraLaContrasenaDeDesarrolloYCierraSesiones() {
        int versionBefore = superUser.getTokenVersion();

        seeder(true).run();

        assertThat(encoder.matches(DEFAULT_PASSWORD, superUser.getPasswordHash())).isTrue();
        assertThat(superUser.getTokenVersion()).isEqualTo(versionBefore + 1);
        verify(users).save(superUser);
    }

    @Test
    void conLaPropiedadActivaYLaContrasenaCorrectaNoTocaNada() {
        superUser.setPasswordHash(encoder.encode(DEFAULT_PASSWORD));
        int versionBefore = superUser.getTokenVersion();

        seeder(true).run();

        assertThat(superUser.getTokenVersion()).isEqualTo(versionBefore);
        verify(users, never()).save(any());
    }

    @Test
    void conLaPropiedadApagadaRespetaLaContrasenaCambiada() {
        String hashBefore = superUser.getPasswordHash();

        seeder(false).run();

        assertThat(superUser.getPasswordHash()).isEqualTo(hashBefore);
        assertThat(encoder.matches(DEFAULT_PASSWORD, superUser.getPasswordHash())).isFalse();
        verify(users, never()).save(any());
    }
}
