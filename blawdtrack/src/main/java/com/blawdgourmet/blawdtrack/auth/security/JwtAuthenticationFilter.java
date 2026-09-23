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

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Filtro de autenticación sin estado. Construye el principal únicamente a partir
 * de los claims del propio JWT, sin consultar la base de datos.
 * <p>
 * La validación de que el usuario sigue activo en cada petición (recargándolo desde
 * la base de datos) corresponde a la task #75 — no se implementa aquí.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";
    private static final String ROLE_PREFIX = "ROLE_";

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HEADER);

        if (header != null && header.startsWith(PREFIX)) {
            String token = header.substring(PREFIX.length());
            try {
                Claims claims = jwtService.validateToken(token);
                autenticarEnContexto(claims);
            } catch (JwtException | IllegalArgumentException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private void autenticarEnContexto(Claims claims) {
        String correo = claims.getSubject();
        Long id = claims.get("id", Long.class);
        String documentId = claims.get("documentId", String.class);
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

        AuthenticatedUser principal = new AuthenticatedUser(id, documentId, fullName, rol, correo);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
