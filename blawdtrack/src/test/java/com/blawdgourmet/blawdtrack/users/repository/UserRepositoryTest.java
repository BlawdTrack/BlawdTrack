package com.blawdgourmet.blawdtrack.users.repository;

import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pruebas de integración (Task #52 / CU-001) para
 * {@link UserRepository#findByEmail(String)}: verifica que la consulta por
 * correo electrónico devuelve al usuario con su rol y permisos ya cargados,
 * y que un correo inexistente no revienta ni encuentra nada.
 */
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    private Role adminRole;

    @BeforeEach
    void setUp() {
        // Role.permissions no tiene cascade configurado (por diseño: los permisos
        // son un catálogo compartido entre roles), así que hay que persistir el
        // Permission por separado antes de asociarlo al Role.
        Permission viewUsers = permissionRepository.save(Permission.builder()
                .code("USERS_VIEW")
                .description("Ver usuarios")
                .build());

        adminRole = roleRepository.save(Role.builder()
                .name("ADMIN")
                .description("Administrador")
                .permissions(Set.of(viewUsers))
                .build());
    }

    @Test
    void findByEmail_conCorreoExistente_devuelveUsuarioConRolYPermisos() {
        User user = User.builder()
                .nationalId("0101010101")
                .fullName("Genesis Silesky")
                .email("genesis@blawdtrack.com")
                .passwordHash("hash-no-real")
                .status(UserStatus.ACTIVE)
                .role(adminRole)
                .build();
        userRepository.saveAndFlush(user);

        Optional<User> found = userRepository.findByEmail("genesis@blawdtrack.com");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("genesis@blawdtrack.com");
        assertThat(found.get().getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(found.get().getRole().getName()).isEqualTo("ADMIN");
        assertThat(found.get().getRole().getPermissions())
                .extracting(Permission::getCode)
                .containsExactly("USERS_VIEW");
    }

    @Test
    void findByEmail_conCorreoInexistente_devuelveOptionalVacio() {
        Optional<User> found = userRepository.findByEmail("no-existe@blawdtrack.com");

        assertThat(found).isEmpty();
    }
}
