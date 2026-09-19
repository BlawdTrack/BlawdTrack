package com.blawdgourmet.blawdtrack.users.dto;

import java.time.Instant;

public record PasswordResetTokenResponse(String token, Instant expiresAt) {
}