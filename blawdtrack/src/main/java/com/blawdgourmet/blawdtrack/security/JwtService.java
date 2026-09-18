package com.blawdgourmet.blawdtrack.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Emisión y validación de tokens JWT (estándar P07 - autenticación JWT sin estado).
 * Genera el token firmado (HS256) emitido al iniciar sesión (HU-001/CU-001) y valida
 * los tokens recibidos en peticiones posteriores para que {@link JwtAuthenticationFilter}
 * pueda resolver al usuario autenticado (claim "uid" con el identificador numérico del usuario).
 */
@Component
public class JwtService {

    private static final String CLAIM_USER_ID = "uid";

    private final SecretKey signingKey;
    private final long expirationMs;
    private final String issuer;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-ms:3600000}") long expirationMs,
            @Value("${security.jwt.issuer:blawdtrack-api}") String issuer
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.issuer = issuer;
    }

    /**
     * Genera un token firmado para el usuario autenticado (HU-001), incluyendo los claims
     * estándar RFC 7519 requeridos por P07 (iss, sub, iat, exp), así como el identificador
     * interno del usuario (claim "uid") requerido por {@link JwtAuthenticationFilter}.
     */
    public String generateToken(User user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusMillis(expirationMs);

        return Jwts.builder()
                .issuer(issuer)
                .subject(user.getEmail())
                .claim(CLAIM_USER_ID, user.getId())
                .claim("rol", user.getRole().getName())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Valida la firma y expiración del token y devuelve sus claims.
     * Lanza {@link io.jsonwebtoken.JwtException} si el token es inválido, expirado o se ha alterado.
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extrae el identificador numérico del usuario (claim "uid") desde los claims del token.
     */
    public Long extractUserId(Claims claims) {
        Object uid = claims.get(CLAIM_USER_ID);
        if (uid == null) {
            return null;
        }
        return Long.valueOf(uid.toString());
    }

    /**
     * Tiempo de vida del token (TTL) en milisegundos, usado por el login (HU-001)
     * para informar al frontend cuándo debe renovarse la sesión.
     */
    public long getExpirationMs() {
        return expirationMs;
    }
}
