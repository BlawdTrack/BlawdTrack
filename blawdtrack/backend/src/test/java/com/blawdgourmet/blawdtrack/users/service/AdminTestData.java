package com.blawdgourmet.blawdtrack.users.service;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

/** Datos de prueba compartidos por los tests de los servicios de administradores. */
final class AdminTestData {

    static final long JWT_EXPIRATION_MS = 3_600_000L;

    static final AuthenticatedUser SUPER_USER_ACTOR = new AuthenticatedUser(
            1L, DocumentType.CEDULA, "1-1111-1111", "Alicia Admin", RoleName.SUPER_USER, "alicia@example.test");

    private AdminTestData() {
    }

    /** Un usuario activo de cédula 1-2345-6789 con el rol indicado. */
    static User userWithRole(String roleName) {
        return User.builder()
                .id(5L)
                .documentType(DocumentType.CEDULA)
                .documentNumber("1-2345-6789")
                .fullName("Ana Perez")
                .email("ana@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(Role.builder().name(roleName).build())
                .build();
    }
}
