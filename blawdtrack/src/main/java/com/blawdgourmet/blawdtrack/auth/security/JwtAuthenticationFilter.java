package com.blawdgourmet.blawdtrack.auth.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

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
    private final UserRepository userRepository;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HEADER);

        if (header != null && header.startsWith(PREFIX) && !esRutaPublica(request)) {
            String token = header.substring(PREFIX.length());
            try {
                Claims claims = jwtService.validateToken(token);
                if (!esRutaDeAutorizacionDeRoles(request)) {
                    validarSesionActual(claims);
                }
                autenticarEnContexto(claims);
            } catch (JwtException | IllegalArgumentException ex) {
                SecurityContextHolder.clearContext();
                restAuthenticationEntryPoint.commence(request, response, new BadCredentialsException("Invalid token", ex));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void validarSesionActual(Claims claims) {
        Long id = claims.get("id", Long.class);
        if (id == null) {
            throw new JwtException("Missing user id in token");
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            throw new JwtException("User not found");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new JwtException("User is inactive");
        }

        int tokenVersionEnToken = jwtService.extractTokenVersion(claims);
        if (tokenVersionEnToken != user.getTokenVersion()) {
            throw new JwtException("Token version mismatch");
        }
    }

    private boolean esRutaPublica(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/api/v1/auth/")
                || uri.startsWith("/swagger-ui/")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/actuator/health")
                || "/error".equals(uri);
    }

    private boolean esRutaDeAutorizacionDeRoles(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.matches("/api/v1/roles/\\d+/permissions");
    }

    private void autenticarEnContexto(Claims claims) {
        String correo = claims.getSubject();
        Long id = claims.get("id", Long.class);
        String documentTypeValue = claims.get("documentType", String.class);
        DocumentType documentType = documentTypeValue == null ? null : DocumentType.valueOf(documentTypeValue);
        String documentNumber = claims.get("documentNumber", String.class);
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

        AuthenticatedUser principal = new AuthenticatedUser(id, documentType, documentNumber, fullName, rol, correo);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
