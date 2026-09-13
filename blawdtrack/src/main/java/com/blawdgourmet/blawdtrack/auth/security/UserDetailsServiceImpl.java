package com.blawdgourmet.blawdtrack.auth.security;

import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Satisface la Task #52 / CU-001: consulta del usuario mediante el correo
     * electrónico proporcionado durante el inicio de sesión, delegando en
     * {@link UserRepository#findByEmail(String)} (que ya carga rol y permisos
     * en la misma consulta vía {@code @EntityGraph}).
     * <p>
     * Reglas de negocio ya cubiertas aquí, para no reimplementarlas:
     * <ul>
     *   <li>Correo no encontrado: se lanza {@link UsernameNotFoundException}
     *       con mensaje genérico, sin revelar si el correo existe o no
     *       (regla de negocio de CU-001).</li>
     *   <li>Usuario inactivo: <b>no</b> se valida en este método. El
     *       {@link UserPrincipal} se construye igual y son sus flags
     *       {@code isEnabled()} / {@code isAccountNonLocked()} (delegando en
     *       {@code User#isActive()}) los que reflejan el estado; Spring
     *       Security ({@code DaoAuthenticationProvider}) los evalúa
     *       automáticamente durante la autenticación. Duplicar esa validación
     *       aquí produciría dos fuentes de verdad para el mismo estado.</li>
     * </ul>
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
        return new UserPrincipal(user);
    }
}