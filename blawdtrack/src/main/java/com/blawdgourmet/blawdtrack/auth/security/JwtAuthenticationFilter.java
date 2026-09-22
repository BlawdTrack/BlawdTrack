package com.blawdgourmet.blawdtrack.auth.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Filtro de autenticación JWT con validación del estado actual del usuario.
 * Como la aplicación es stateless, cada petición verifica en base de datos
 * que el usuario siga existiendo y activo para revocar accesos con JWT antiguos.
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
                Long id = claims.get("id", Long.class);
                if (id == null) {
                    SecurityContextHolder.clearContext();
                } else {
                    User usuarioActual = userRepository.findById(id).orElse(null);
                    if (usuarioActual == null || !usuarioActual.isActive()) {
                        SecurityContextHolder.clearContext();
                    } else {
                        autenticarEnContexto(claims, usuarioActual);
                    }
                }
            } catch (JwtException | IllegalArgumentException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private void autenticarEnContexto(Claims claims, User usuarioActual) {
        String correo = claims.getSubject();
        String nationalId = claims.get("nationalId", String.class);
        String fullName = claims.get("fullName", String.class);
        String rolesClaim = claims.get("roles", String.class);

        List<GrantedAuthority> authorities = Arrays.stream(rolesClaim.split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        String rol = usuarioActual.getRole() == null ? null : usuarioActual.getRole().getName();
        AuthenticatedUser principal = new AuthenticatedUser(usuarioActual.getId(), nationalId, fullName, rol, correo);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
