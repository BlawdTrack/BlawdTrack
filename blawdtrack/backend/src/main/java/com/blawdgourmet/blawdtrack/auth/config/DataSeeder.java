package com.blawdgourmet.blawdtrack.auth.config;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

/**
 * Crea el Super Usuario por defecto para desarrollo/pruebas. Los roles y
 * permisos base los siembra {@link com.blawdgourmet.blawdtrack.users.bootstrap.RoleDataInitializer},
 * que corre antes (@Order) para que el rol Super Usuario ya exista aquí.
 */
@Component
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
    private final boolean resetSuperUserPassword;
    private final String seedPassword;

    /**
     * @param resetSuperUserPassword si es {@code true}, cada arranque deja al Super Usuario por defecto con la
     *        contraseña sembrada aunque alguien la haya cambiado (propiedad
     *        {@code app.seed.super-user.reset-password}). Solo para entornos de desarrollo: esa contraseña
     *        está en el repositorio, así que en un despliegue real debe estar desactivada.
     * @param initialPassword contraseña con la que nace el Super Usuario (propiedad
     *        {@code app.seed.super-user.initial-password}). Si está vacía se usa la de desarrollo; en un
     *        despliegue real se define por variable de entorno para que la contraseña pública nunca se use.
     */
    public DataSeeder(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.super-user.reset-password:false}") boolean resetSuperUserPassword,
            @Value("${app.seed.super-user.initial-password:}") String initialPassword) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.resetSuperUserPassword = resetSuperUserPassword;
        this.seedPassword = initialPassword == null || initialPassword.isBlank()
                ? DEFAULT_SUPER_USER_PASSWORD
                : initialPassword;
    }

    @Override
    public void run(String... args) {
        seedDefaultAdminUser();
    }

    private void seedDefaultAdminUser() {
        Optional<User> defaultSuperUser =
                userRepository.findByEmail(DEFAULT_SUPER_USER_EMAIL);
        if (defaultSuperUser.isPresent()) {
            refreshDefaultSuperUser(defaultSuperUser.get());
            return;
        }

        Optional<User> legacySuperUser =
                userRepository.findByEmail(LEGACY_SUPER_USER_EMAIL);
        if (legacySuperUser.isPresent()) {
            migrateLegacySuperUser(legacySuperUser.get());
            return;
        }

        createDefaultSuperUser();
    }

    /** Pone al día nombre y contraseña del Super Usuario por defecto sin recrearlo. */
    private void refreshDefaultSuperUser(User admin) {
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
            admin.setPasswordHash(passwordEncoder.encode(seedPassword));
            log.info(
                    "Default Super User legacy password updated"
            );
            updated = true;
        }

        if (resetSuperUserPassword && !hasSeedPassword(admin)) {
            // changePassword también cierra las sesiones abiertas con la contraseña anterior.
            admin.changePassword(passwordEncoder.encode(seedPassword));
            log.warn(
                    "Default Super User password restored (app.seed.super-user.reset-password=true); "
                            + "disable it outside development"
            );
            updated = true;
        }

        if (updated) {
            userRepository.save(admin);
        }

        log.info(
                "Default Super User already exists, skipping creation"
        );
    }

    private void migrateLegacySuperUser(User admin) {
        admin.setEmail(DEFAULT_SUPER_USER_EMAIL);
        admin.setFullName(DEFAULT_SUPER_USER_NAME);

        if (usesLegacyDefaultPassword(admin)) {
            admin.setPasswordHash(passwordEncoder.encode(seedPassword));
        }

        userRepository.save(admin);

        log.info(
                "Default Super User migrated from {} to {} with name {}",
                LEGACY_SUPER_USER_EMAIL,
                DEFAULT_SUPER_USER_EMAIL,
                DEFAULT_SUPER_USER_NAME
        );
    }

    private void createDefaultSuperUser() {
        Role superUserRole = roleRepository.findByName(RoleName.SUPER_USER)
                .orElseThrow(() -> new IllegalStateException(
                        "Role not seeded: " + RoleName.SUPER_USER));

        User admin = User.builder()
                .documentType(DocumentType.CEDULA)
                .documentNumber("000000000")
                .documentId("000000000")
                .fullName(DEFAULT_SUPER_USER_NAME)
                .email(DEFAULT_SUPER_USER_EMAIL)
                .passwordHash(passwordEncoder.encode(seedPassword))
                .phone("00000000")
                .status(UserStatus.ACTIVE)
                .role(superUserRole)
                .build();

        userRepository.save(admin);

        if (DEFAULT_SUPER_USER_PASSWORD.equals(seedPassword)) {
            log.warn(
                    "Default Super User created ({}) with the public development password. "
                            + "Set app.seed.super-user.initial-password before going to production.",
                    DEFAULT_SUPER_USER_EMAIL
            );
        } else {
            log.info("Default Super User created ({}) with the configured initial password", DEFAULT_SUPER_USER_EMAIL);
        }
    }

    private boolean hasSeedPassword(User user) {
        return passwordEncoder.matches(
                seedPassword,
                user.getPasswordHash()
        );
    }

    private boolean usesLegacyDefaultPassword(User user) {
        return passwordEncoder.matches(
                LEGACY_SUPER_USER_PASSWORD,
                user.getPasswordHash()
        );
    }
}
