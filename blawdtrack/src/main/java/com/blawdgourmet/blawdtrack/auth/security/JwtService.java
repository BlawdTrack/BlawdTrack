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

@Component
public class JwtService {

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
                .claim("documentType", principal.getUser().getDocumentType())
                .claim("documentNumber", principal.getUser().getDocumentNumber())
                .claim("fullName", principal.getUser().getFullName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key())
                .compact();
    }
}
