package com.blawdgourmet.blawdtrack.auth.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Emite y valida los tokens JWT de sesión (HU-001).
 * <p>
 * El token se firma con HMAC usando {@code security.jwt.secret} (variable de entorno
 * {@code JWT_SECRET}, sin valor por defecto) y vence a los {@code security.jwt.expiration-ms}
 * milisegundos. Además del correo (subject) lleva el id, el documento, el nombre, las autoridades
 * y {@code tokenVersion}, que permite invalidar sesiones sin esperar a que el token venza.
 */
@Component
public class JwtService {

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Verifica la firma y la vigencia del token y comprueba que traiga los datos mínimos
     * (subject, expiración, id y autoridades).
     *
     * @throws JwtException si el token está mal formado, vencido, con firma inválida o incompleto
     */
    public Claims validateToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload();
        if (claims.getSubject() == null || claims.getSubject().isBlank()
                || claims.getExpiration() == null
                || !(claims.get("id") instanceof Number)
                || claims.get("roles", String.class) == null
                || claims.get("roles", String.class).isBlank()) {
            throw new JwtException("Invalid token claims");
        }
        return claims;
    }

    /** Genera el JWT firmado del usuario autenticado. */
    public String generateToken(UserPrincipal principal) {
        String roles = principal.getAuthorities().stream()
                .map(Object::toString)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .subject(principal.getUsername())
                .claim("id", principal.getId())
                .claim("roles", roles)
                .claim("documentType", principal.getUser().getDocumentType())
                .claim("documentNumber", principal.getUser().getDocumentNumber())
                .claim("fullName", principal.getUser().getFullName())
                .claim("tokenVersion", principal.getUser().getTokenVersion())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key())
                .compact();
    }

    /** Versión de sesión guardada en el token; {@code 0} si falta o no es numérica (tokens antiguos). */
    public int extractTokenVersion(Claims claims) {
        Object value = claims.get("tokenVersion");
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            return 0;
        }
    }
}
