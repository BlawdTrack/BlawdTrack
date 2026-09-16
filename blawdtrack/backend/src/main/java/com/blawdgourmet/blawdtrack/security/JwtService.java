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
* JWT token issuance and validation (P07 standard - Stateless JWT authentication).
* Generates the signed token (HS256) issued at login (HU-001/CU-001) and validates
* tokens received in subsequent requests so that {@link JwtAuthenticationFilter}
* can resolve the authenticated user (claim "uid" with the numeric user ID).
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
     * Generates a signed token for the authenticated user (HU-001), including the
     * standard RFC 7519 claims required by P07 (iss, sub, iat, exp), as well as
     * the internal user identifier (claim "uid") required by {@link JwtAuthenticationFilter}.
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
     * Validates the token signature and expiration and returns its claims.
     * Throws {@link io.jsonwebtoken.JwtException} if the token is invalid, expired,
     * or tampered with.
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts the numeric user identifier (claim "uid") from the token claims.
     */
    public Long extractUserId(Claims claims) {
        Object uid = claims.get(CLAIM_USER_ID);
        if (uid == null) {
            return null;
        }
        return Long.valueOf(uid.toString());
    }

    /**
     * Token lifetime (TTL) in milliseconds, used by login (HU-001)
     * to inform the frontend when the session should be renewed.
     */
    public long getExpirationMs() {
        return expirationMs;
    }
}
