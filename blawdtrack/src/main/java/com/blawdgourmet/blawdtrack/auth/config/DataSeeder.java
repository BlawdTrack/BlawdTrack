package com.blawdgourmet.blawdtrack.auth.config;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.constant.PermissionCode;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.PermissionRepository;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
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
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Map<String, Permission> permissions = seedPermissions();
        Map<String, Role> roles = seedRoles(permissions);
        seedDefaultAdminUser(roles.get(RoleName.SUPER_USER));
    }

    private Map<String, Permission> seedPermissions() {
        List<String> codes = List.of(
                PermissionCode.USER_CREATE,
                PermissionCode.USER_UPDATE,
                PermissionCode.USER_DEACTIVATE,
                PermissionCode.USER_DELETE,
                PermissionCode.ROLE_ASSIGN,
                PermissionCode.PACKAGE_IMPORT,
                PermissionCode.PACKAGE_DELETE,
                PermissionCode.PACKAGE_VIEW,
                PermissionCode.PACKAGE_SEARCH,
                PermissionCode.PACKAGE_EXPORT,
                PermissionCode.PACKAGE_GENERATE_QR,
                PermissionCode.PACKAGE_ASSIGN,
                PermissionCode.PACKAGE_VIEW_ASSIGNED,
                PermissionCode.PACKAGE_UPDATE_STATUS,
                PermissionCode.TRIP_COST_REGISTER,
                PermissionCode.REPORT_VIEW,
                PermissionCode.REPORT_PRINT,
                PermissionCode.PROOF_OF_DELIVERY_VIEW,
                PermissionCode.COST_VIEW
        );

        Map<String, Permission> result = new HashMap<>();

        for (String code : codes) {
            Permission permission = permissionRepository.findAll().stream()
                    .filter(p -> p.getCode().equals(code))
                    .findFirst()
                    .orElseGet(() -> permissionRepository.save(
                            Permission.builder()
                                    .code(code)
                                    .description(code)
                                    .build()
                    ));

            result.put(code, permission);
        }

        log.info("Base permissions verified/created: {}", result.size());
        return result;
    }

    private Map<String, Role> seedRoles(
            Map<String, Permission> permissions) {

        Map<String, Role> roles = new HashMap<>();

        Set<Permission> superUserPermissions =
                new HashSet<>(permissions.values());

        roles.put(
                RoleName.SUPER_USER,
                createOrUpdateRole(
                        RoleName.SUPER_USER,
                        "Full access to all system modules",
                        superUserPermissions
                )
        );

        Set<Permission> salesAdminPermissions = Set.of(
                permissions.get(PermissionCode.PACKAGE_IMPORT),
                permissions.get(PermissionCode.PACKAGE_DELETE),
                permissions.get(PermissionCode.PACKAGE_VIEW),
                permissions.get(PermissionCode.PACKAGE_SEARCH),
                permissions.get(PermissionCode.PACKAGE_EXPORT),
                permissions.get(PermissionCode.PACKAGE_GENERATE_QR),
                permissions.get(PermissionCode.PACKAGE_ASSIGN),
                permissions.get(PermissionCode.REPORT_VIEW),
                permissions.get(PermissionCode.REPORT_PRINT),
                permissions.get(PermissionCode.PROOF_OF_DELIVERY_VIEW),
                permissions.get(PermissionCode.COST_VIEW)
        );

        roles.put(
                RoleName.SALES_ADMIN,
                createOrUpdateRole(
                        RoleName.SALES_ADMIN,
                        "Package management, courier assignment and reports",
                        salesAdminPermissions
                )
        );

        Set<Permission> courierPermissions = Set.of(
                permissions.get(PermissionCode.PACKAGE_VIEW_ASSIGNED),
                permissions.get(PermissionCode.PACKAGE_UPDATE_STATUS),
                permissions.get(PermissionCode.TRIP_COST_REGISTER)
        );

        roles.put(
                RoleName.COURIER,
                createOrUpdateRole(
                        RoleName.COURIER,
                        "View assigned deliveries and update status",
                        courierPermissions
                )
        );

        log.info("Base roles verified/created: {}", roles.keySet());
        return roles;
    }

    private Role createOrUpdateRole(
            String name,
            String description,
            Set<Permission> permissions) {

        if (RoleName.SUPER_USER.equals(name)) {
            Role role = roleRepository.findByName(name)
                    .orElseGet(() -> Role.builder()
                            .name(name)
                            .description(description)
                            .build());

            role.setPermissions(permissions);
            return roleRepository.save(role);
        }

        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name(name)
                                .description(description)
                                .permissions(permissions)
                                .build()
                ));
    }

    private void seedDefaultAdminUser(Role superUserRole) {
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