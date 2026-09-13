package com.blawdgourmet.blawdtrack.auth.security;

import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias (Task #52 / CU-001) para
 * {@link UserDetailsServiceImpl#loadUserByUsername(String)}, mockeando
 * {@link UserRepository} para no depender de base de datos.
 */
@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private User buildUser(UserStatus status) {
        Role role = Role.builder()
                .name("ADMIN")
                .permissions(Collections.emptySet())
                .build();

        return User.builder()
                .id(1L)
                .nationalId("0101010101")
                .fullName("Genesis Silesky")
                .email("genesis@blawdtrack.com")
                .passwordHash("hash-no-real")
                .status(status)
                .role(role)
                .build();
    }

    @Test
    void loadUserByUsername_conCorreoExistenteYActivo_devuelveUserPrincipal() {
        User user = buildUser(UserStatus.ACTIVE);
        when(userRepository.findByEmail("genesis@blawdtrack.com")).thenReturn(Optional.of(user));

        UserDetails result = userDetailsService.loadUserByUsername("genesis@blawdtrack.com");

        assertThat(result).isInstanceOf(UserPrincipal.class);
        assertThat(result.getUsername()).isEqualTo("genesis@blawdtrack.com");
        assertThat(result.isEnabled()).isTrue();
        assertThat(result.isAccountNonLocked()).isTrue();
    }

    @Test
    void loadUserByUsername_conCorreoInexistente_lanzaUsernameNotFoundException() {
        when(userRepository.findByEmail("no-existe@blawdtrack.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("no-existe@blawdtrack.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void loadUserByUsername_conUsuarioInactivo_devuelveUserPrincipalConFlagsEnFalse() {
        // El servicio NO lanza excepción para un usuario inactivo: la validación
        // de estado vive en UserPrincipal.isEnabled()/isAccountNonLocked(), que
        // Spring Security evalúa en la capa de autenticación. Ver Javadoc de
        // UserDetailsServiceImpl para la justificación de esta decisión.
        User user = buildUser(UserStatus.INACTIVE);
        when(userRepository.findByEmail("genesis@blawdtrack.com")).thenReturn(Optional.of(user));

        UserDetails result = userDetailsService.loadUserByUsername("genesis@blawdtrack.com");

        assertThat(result).isInstanceOf(UserPrincipal.class);
        assertThat(result.isEnabled()).isFalse();
        assertThat(result.isAccountNonLocked()).isFalse();
    }
}
