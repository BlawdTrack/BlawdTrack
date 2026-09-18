package com.blawdgourmet.blawdtrack.security;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

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
* Stateless authentication filter (P06/P07). For each request:
* 1) Validates the JWT received in the Authorization header.
* 2) Reloads the user from the database instead of trusting cached claims,
*    so role changes or deactivation (HU-004, HU-005, HU-007, HU-009) take effect
*    immediately on subsequent requests, as required by the PAP/architecture.
* 3) Publishes an {@link AuthenticatedUser} as the principal with the authority "ROLE_<role>"
*    consumed by @PreAuthorize checks (for example, admin registration).
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
 
    private static final String ENCABEZADO_AUTORIZACION = "Authorization";
    private static final String PREFIJO_BEARER = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = extraerToken(request);

        if (token != null) {
            try {
                Claims claims = jwtService.parseClaims(token);
                Long userId = jwtService.extractUserId(claims);

                Optional.ofNullable(userId)
                        .flatMap(userRepository::findById)
                        .filter(User::isActive)
                        .ifPresent(this::autenticarEnContexto);

            } catch (JwtException | IllegalArgumentException ex) {
                // Missing, invalid, or expired token: the request continues without authentication,
                // and the corresponding authorization rule (authenticated()/@PreAuthorize)
                // will reject it.
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private void autenticarEnContexto(User usuario) {
        AuthenticatedUser principal = new AuthenticatedUser(
                usuario.getId(),
                usuario.getNationalId(),
                usuario.getFullName(),
                usuario.getRole().getName()
        );

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + usuario.getRole().getName())
        );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String extraerToken(HttpServletRequest request) {
        String header = request.getHeader(ENCABEZADO_AUTORIZACION);
        if (header != null && header.startsWith(PREFIJO_BEARER)) {
            return header.substring(PREFIJO_BEARER.length());
        }
        return null;
    }
}
