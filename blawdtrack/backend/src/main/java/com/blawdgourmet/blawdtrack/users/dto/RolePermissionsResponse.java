package com.blawdgourmet.blawdtrack.users.dto;

import java.util.Set;

public record RolePermissionsResponse(Long roleId, String role, Set<String> permissions) {
}
