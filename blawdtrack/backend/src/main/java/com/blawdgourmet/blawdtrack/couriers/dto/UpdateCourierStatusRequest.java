package com.blawdgourmet.blawdtrack.couriers.dto;

import com.blawdgourmet.blawdtrack.users.model.UserStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateCourierStatusRequest(@NotNull UserStatus status) {
}
