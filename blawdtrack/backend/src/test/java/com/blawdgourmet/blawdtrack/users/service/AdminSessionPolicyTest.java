package com.blawdgourmet.blawdtrack.users.service;

import static com.blawdgourmet.blawdtrack.users.service.AdminTestData.JWT_EXPIRATION_MS;
import static com.blawdgourmet.blawdtrack.users.service.AdminTestData.userWithRole;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;

class AdminSessionPolicyTest {

    private final AdminSessionPolicy policy = new AdminSessionPolicy(JWT_EXPIRATION_MS);

    @Test
    void aLoginInsideTheTokenLifetimeCountsAsAnActiveSession() {
        User admin = userWithRole(RoleName.SALES_ADMIN);
        admin.setLastLoginAt(LocalDateTime.now().minusMinutes(5));

        assertThat(policy.hasActiveSession(admin)).isTrue();
    }

    @Test
    void aLoginOlderThanTheTokenLifetimeDoesNot() {
        User admin = userWithRole(RoleName.SALES_ADMIN);
        admin.setLastLoginAt(LocalDateTime.now().minusHours(2));

        assertThat(policy.hasActiveSession(admin)).isFalse();
    }

    @Test
    void anAdminWhoNeverLoggedInHasNoSession() {
        assertThat(policy.hasActiveSession(userWithRole(RoleName.SALES_ADMIN))).isFalse();
    }
}
