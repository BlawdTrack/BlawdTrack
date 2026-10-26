package com.blawdgourmet.blawdtrack.auth.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * HU-001 (encriptación en tránsito): cuando esta app termina TLS ella misma
 * (server.ssl.enabled=true), redirige toda petición HTTP plana a su
 * equivalente HTTPS antes de que llegue a cualquier endpoint, incluyendo
 * /api/v1/auth/login.
 * <p>
 * Reemplaza a HttpSecurity.requiresChannel(...), que en Spring Security 7.1
 * ya no existe (spring-security-web dejó de incluir
 * org.springframework.security.web.access.channel.ChannelEntryPoint).
 * <p>
 * Con sslEnabled=false (el valor por defecto en desarrollo, y en cualquier
 * despliegue donde el TLS lo termina un proxy delante de esta app) este
 * filtro no hace nada.
 */
@Component
public class HttpsEnforcementFilter extends OncePerRequestFilter {

    @Value("${server.ssl.enabled:false}")
    private boolean sslEnabled;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (sslEnabled && !request.isSecure()) {
            String query = request.getQueryString();
            String httpsUrl = "https://" + request.getServerName() + request.getRequestURI()
                    + (query != null ? "?" + query : "");
            response.sendRedirect(httpsUrl);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
