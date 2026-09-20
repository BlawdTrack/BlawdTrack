package com.blawdgourmet.blawdtrack.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtService {

    private static final String TOKEN_VERSION_CLAIM = "tokenVersion";

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims validateToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload();
        if (claims.getSubject() == null || claims.getSubject().isBlank()
                || claims.getExpiration() == null
                || claims.get("roles", String.class) == null
                || claims.get("roles", String.class).isBlank()) {
            throw new JwtException("Invalid token claims");
        }
        return claims;
    }

    public String generateToken(UserPrincipal principal) {
        String roles = principal.getAuthorities().stream()
                .map(Object::toString)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .subject(principal.getUsername())
                .claim("id", principal.getId())
                .claim("roles", roles)
                .claim("nationalId", principal.getUser().getNationalId())
                .claim("fullName", principal.getUser().getFullName())
                .claim(TOKEN_VERSION_CLAIM, principal.getTokenVersion())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key())
                .compact();
    }

    /**
     * Versión de sesión con la que se emitió el token. Los tokens anteriores a la
     * introducción del claim no lo traen y se consideran versión 0.
     */
    public int extractTokenVersion(Claims claims) {
        Integer version = claims.get(TOKEN_VERSION_CLAIM, Integer.class);
        return version == null ? 0 : version;
    }
}
