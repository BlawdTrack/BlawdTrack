package com.blawdgourmet.blawdtrack.users.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.model.User;

/**
 * Decide si un usuario figura con sesión activa.
 *
 * <p>Considera activa una sesión cuando el último inicio exitoso ocurrió dentro de la vigencia configurada del
 * token JWT ({@code jwtExpirationMs}). Es una aproximación por expiración, no un estado real de sesión. El filtro
 * JWT sí valida en cada petición que el usuario exista, esté activo y que {@code tokenVersion} coincida, pero hoy
 * no existe un endpoint de logout y nada incrementa {@code tokenVersion} ni limpia {@code lastLoginAt} al cerrar
 * sesión (solo {@code User.changeStatus} y {@code User.changePassword} suben la versión). Por eso un administrador
 * que cerró sesión sigue figurando como "sesión activa" hasta que se cumple {@code jwtExpirationMs} desde su último
 * inicio. Corregirlo requiere un logout en el backend, que es una task aparte.
 */
@Component
public class AdminSessionPolicy {

    private final long jwtExpirationMs;

    public AdminSessionPolicy(@Value("${security.jwt.expiration-ms}") long jwtExpirationMs) {
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public boolean hasActiveSession(User user) {
        return user.getLastLoginAt() != null
                && LocalDateTime.now().isBefore(user.getLastLoginAt().plus(jwtExpirationMs, ChronoUnit.MILLIS));
    }
}
