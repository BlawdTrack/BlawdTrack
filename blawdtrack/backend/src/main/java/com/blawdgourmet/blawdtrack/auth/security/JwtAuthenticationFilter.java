package com.blawdgourmet.blawdtrack.auth.security;

import java.util.Set;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro de autenticación sin estado.
 *
 * En cada petición protegida valida la firma y expiración del JWT y consulta
 * el usuario actual en la base de datos. Esto permite aplicar inmediatamente
 * los cambios de estado, versión de sesión, rol y permisos sin emitir un token
 * nuevo.
 *
 * Si el usuario no existe, está inactivo, el identificador no coincide o la
 * versión del token dejó de ser válida, responde con HTTP 401.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader(HEADER);

        if (header != null
                && header.startsWith(PREFIX)
                && !isPublicRoute(request)) {

            String token = header.substring(PREFIX.length());

            try {
                Claims claims = jwtService.validateToken(token);
                String email = claims.getSubject();

                UserPrincipal principal = (UserPrincipal)
                        userDetailsService.loadUserByUsername(email);

                if (!isSessionValid(claims, principal)) {
                    throw new JwtException("Invalid token user");
                }

                authenticateInContext(principal);
            } catch (
                    JwtException
                    | IllegalArgumentException
                    | UsernameNotFoundException ex
            ) {
                SecurityContextHolder.clearContext();

                restAuthenticationEntryPoint.commence(
                        request,
                        response,
                        new BadCredentialsException(
                                "Invalid token",
                                ex
                        )
                );

                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * La sesión continúa vigente únicamente cuando:
     *
     * - El identificador del JWT coincide con el usuario actual.
     * - La cuenta continúa activa.
     * - La versión del JWT coincide con la versión guardada.
     */
    private boolean isSessionValid(
            Claims claims,
            UserPrincipal principal
    ) {
        Number tokenUserId = claims.get("id", Number.class);

        if (tokenUserId == null
                || !principal.getId().equals(tokenUserId.longValue())
                || !principal.isEnabled()) {
            return false;
        }

        int tokenVersion = jwtService.extractTokenVersion(claims);

        return principal.getTokenVersion() == tokenVersion;
    }

    /**
     * Construye el principal de la solicitud con la información vigente del
     * usuario. Las autoridades se obtienen del rol y los permisos actuales
     * cargados desde la base de datos.
     */
    private void authenticateInContext(UserPrincipal principal) {
        var user = principal.getUser();

        var authenticatedUser = new AuthenticatedUser(
                user.getId(),
                user.getDocumentType(),
                user.getDocumentNumber(),
                user.getFullName(),
                user.getRole().getName(),
                user.getEmail()
        );

        var authentication = new UsernamePasswordAuthenticationToken(
                authenticatedUser,
                null,
                principal.getAuthorities()
        );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }

    /** Rutas bajo /api/v1/auth/ que exigen sesión: el filtro debe validar su token. */
    private static final Set<String> AUTHENTICATED_AUTH_ROUTES = Set.of(
            "/api/v1/auth/password-reset/request-own",
            "/api/v1/auth/logout",
            "/api/v1/auth/session");

    private boolean isPublicRoute(HttpServletRequest request) {
        String uri = request.getRequestURI();

        if (AUTHENTICATED_AUTH_ROUTES.contains(uri)) {
            return false;
        }

        return uri.startsWith("/api/v1/auth/")
                || uri.startsWith("/swagger-ui/")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/actuator/health")
                || "/error".equals(uri);
    }
}