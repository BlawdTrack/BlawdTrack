package com.blawdgourmet.blawdtrack.auth.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Crea el Super Usuario por defecto para desarrollo/pruebas. Los roles y
 * permisos base los siembra {@link com.blawdgourmet.blawdtrack.users.bootstrap.RoleDataInitializer},
 * que corre antes (@Order) para que el rol Super Usuario ya exista aquí.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class DataSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "alicia@blawdgourmet.com";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            log.info("Default Super User already exists, skipping creation");
            return;
        }

        Role superUserRole = roleRepository.findByName(RoleName.SUPER_USER)
                .orElseThrow(() -> new IllegalStateException(
                        "Role not seeded: " + RoleName.SUPER_USER));

        User admin = User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("000000000")
                .documentId("000000000")
                .fullName("Alicia (Default Super User)")
                .email(ADMIN_EMAIL)
                .passwordHash(passwordEncoder.encode("ChangeMe123"))
                .phone("00000000")
                .status(UserStatus.ACTIVE)
                .role(superUserRole)
                .build();

        userRepository.save(admin);
        log.warn("Default Super User created ({}). A password change should be enforced before going to production.", ADMIN_EMAIL);
    }
}
