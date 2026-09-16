package com.blawdgourmet.blawdtrack.audit.dto;

/**
 * Successful response of the login endpoint.
 *
 * @param token            signed JWT (HS256) to be sent in the
 *                         Authorization: Bearer &lt;token&gt; header on subsequent requests
 * @param tokenType        token type, always "Bearer"
 * @param expiresInSeconds token time-to-live (TTL) in seconds
 * @param user             basic information of the authenticated user
 */
public record LoginResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        UserSummaryResponse user
) {
}
