package com.blawdgourmet.blawdtrack.auth.config;

import java.util.Optional;

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

    private static final String DEFAULT_SUPER_USER_EMAIL =
            "superadmin@blawdgourmet.com";
    private static final String DEFAULT_SUPER_USER_NAME =
            "Super Usuario";
    private static final String DEFAULT_SUPER_USER_PASSWORD =
            "ultra_gorGon_1!";

    private static final String LEGACY_SUPER_USER_EMAIL =
            "alicia@blawdgourmet.com";
    private static final String LEGACY_SUPER_USER_PASSWORD =
            "ChangeMe123";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedDefaultAdminUser();
    }

    private void seedDefaultAdminUser() {
        Optional<User> defaultSuperUser =
                userRepository.findByEmail(DEFAULT_SUPER_USER_EMAIL);

        if (defaultSuperUser.isPresent()) {
            User admin = defaultSuperUser.get();
            boolean updated = false;

            if (!DEFAULT_SUPER_USER_NAME.equals(admin.getFullName())) {
                admin.setFullName(DEFAULT_SUPER_USER_NAME);
                log.info(
                        "Default Super User name updated to {}",
                        DEFAULT_SUPER_USER_NAME
                );
                updated = true;
            }

            if (usesLegacyDefaultPassword(admin)) {
                admin.setPasswordHash(
                        passwordEncoder.encode(
                                DEFAULT_SUPER_USER_PASSWORD
                        )
                );
                log.info(
                        "Default Super User legacy password updated"
                );
                updated = true;
            }

            if (updated) {
                userRepository.save(admin);
            }

            log.info(
                    "Default Super User already exists, skipping creation"
            );
            return;
        }

        Optional<User> legacySuperUser =
                userRepository.findByEmail(LEGACY_SUPER_USER_EMAIL);

        if (legacySuperUser.isPresent()) {
            User admin = legacySuperUser.get();

            admin.setEmail(DEFAULT_SUPER_USER_EMAIL);
            admin.setFullName(DEFAULT_SUPER_USER_NAME);

            if (usesLegacyDefaultPassword(admin)) {
                admin.setPasswordHash(
                        passwordEncoder.encode(
                                DEFAULT_SUPER_USER_PASSWORD
                        )
                );
            }

            userRepository.save(admin);

            log.info(
                    "Default Super User migrated from {} to {} with name {}",
                    LEGACY_SUPER_USER_EMAIL,
                    DEFAULT_SUPER_USER_EMAIL,
                    DEFAULT_SUPER_USER_NAME
            );
            return;
        }

        Role superUserRole = roleRepository.findByName(RoleName.SUPER_USER)
                .orElseThrow(() -> new IllegalStateException(
                        "Role not seeded: " + RoleName.SUPER_USER));

        User admin = User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("000000000")
                .documentId("000000000")
                .fullName(DEFAULT_SUPER_USER_NAME)
                .email(DEFAULT_SUPER_USER_EMAIL)
                .passwordHash(
                        passwordEncoder.encode(
                                DEFAULT_SUPER_USER_PASSWORD
                        )
                )
                .phone("00000000")
                .status(UserStatus.ACTIVE)
                .role(superUserRole)
                .build();

        userRepository.save(admin);

        log.warn(
                "Default Super User created ({}). "
                        + "A password change should be enforced "
                        + "before going to production.",
                DEFAULT_SUPER_USER_EMAIL
        );
    }

    private boolean usesLegacyDefaultPassword(User user) {
        return passwordEncoder.matches(
                LEGACY_SUPER_USER_PASSWORD,
                user.getPasswordHash()
        );
    }
}