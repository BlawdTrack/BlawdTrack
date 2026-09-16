package com.blawdgourmet.blawdtrack.users.bootstrap;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Usuarios de prueba para desarrollo local, con las mismas credenciales que
 * ya usa el mock del frontend (src/mocks/mockUsers.js), para poder probar
 * el login real sin tener que crear cuentas a mano.
 * <p>
 * Corre después de {@link RoleDataInitializer} (@Order 2 vs 1) porque
 * necesita que los roles ya existan.
 * <p>
 * ⚠️ Solo para el perfil de desarrollo local con H2 en memoria — no debe
 * ir a un ambiente con datos reales.
 */
@Component
@Order(2)
@RequiredArgsConstructor
public class UserDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        ensureUser("1-0000-0001", "Alicia (Super Usuario)", "alicia@blawdgourmet.com",
                "ChangeMe123", RoleName.SUPER_USER, UserStatus.ACTIVE);

        ensureUser("1-0000-0002", "Administrador de Ventas (prueba)", "admin.ventas@blawdgourmet.com",
                "Ventas123", RoleName.SALES_ADMIN, UserStatus.ACTIVE);

        ensureUser("1-0000-0003", "Mensajero (prueba)", "mensajero@blawdgourmet.com",
                "Mensajero123", RoleName.COURIER, UserStatus.ACTIVE);

        ensureUser("1-0000-0004", "Cuenta inactiva (prueba)", "inactivo@blawdgourmet.com",
                "Inactivo123", RoleName.COURIER, UserStatus.INACTIVE);
    }

    private void ensureUser(String nationalId, String fullName, String email, String rawPassword,
                             String roleName, UserStatus status) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not found: " + roleName));

        User user = User.builder()
                .nationalId(nationalId)
                .fullName(fullName)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .status(status)
                .role(role)
                .build();

        userRepository.save(user);
    }
}
