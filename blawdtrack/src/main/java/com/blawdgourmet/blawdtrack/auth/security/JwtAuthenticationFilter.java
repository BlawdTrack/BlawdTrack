package com.blawdgourmet.blawdtrack.auth.security;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Filtro de autenticación sin estado. Construye el principal a partir de los claims
 * del propio JWT, pero en cada petición consulta el estado de la cuenta y la versión
 * de sus tokens (sin cargar rol ni permisos) para cerrar las sesiones invalidadas:
 * si el usuario ya no existe, está inactivo o el claim {@code tokenVersion} (0 si
 * falta) no coincide con la versión actual, la petición continúa sin autenticar y
 * {@link RestAuthenticationEntryPoint} responde 401 en las rutas protegidas.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";
    private static final String ROLE_PREFIX = "ROLE_";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HEADER);

        if (header != null && header.startsWith(PREFIX)) {
            String token = header.substring(PREFIX.length());
            try {
                Claims claims = jwtService.validateToken(token);
                if (isSessionValid(claims)) {
                    autenticarEnContexto(claims);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } catch (JwtException | IllegalArgumentException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * La sesión sigue vigente solo si el token identifica a un usuario existente,
     * activo y cuya versión de token coincide con la del claim.
     */
    private boolean isSessionValid(Claims claims) {
        Long id = claims.get("id", Long.class);
        if (id == null) {
            return false;
        }
        int tokenVersion = jwtService.extractTokenVersion(claims);
        return userRepository.findSessionStateById(id)
                .filter(state -> state.getStatus() == UserStatus.ACTIVE)
                .filter(state -> state.getTokenVersion() == tokenVersion)
                .isPresent();
    }

    private void autenticarEnContexto(Claims claims) {
        String correo = claims.getSubject();
        Long id = claims.get("id", Long.class);
        String nationalId = claims.get("nationalId", String.class);
        String fullName = claims.get("fullName", String.class);
        String rolesClaim = claims.get("roles", String.class);

        List<GrantedAuthority> authorities = Arrays.stream(rolesClaim.split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        String rol = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith(ROLE_PREFIX))
                .findFirst()
                .map(authority -> authority.substring(ROLE_PREFIX.length()))
                .orElse(null);

        AuthenticatedUser principal = new AuthenticatedUser(id, nationalId, fullName, rol, correo);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
