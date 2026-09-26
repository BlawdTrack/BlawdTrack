package com.blawdgourmet.blawdtrack.users.repository;

import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserPermission;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserPermissionRepositoryTest {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PermissionRepository permissionRepository;
    @Autowired private UserPermissionRepository userPermissionRepository;
    @Autowired private EntityManager entityManager;

    @Test
    void guardaConcesionesYRevocacionesIndividualesSinModificarPermisosDelRol() {
        Permission assigned = permissionRepository.save(Permission.builder().code("PAQUETE_CONSULTAR").build());
        Permission extra = permissionRepository.save(Permission.builder().code("REPORTE_CONSULTAR").build());
        Role role = roleRepository.save(Role.builder()
                .name("MENSAJERO")
                .permissions(Set.of(assigned))
                .build());
        User user = userRepository.save(User.builder()
                .documentId("101010101")
                .fullName("Mensajero de prueba")
                .email("mensajero@prueba.test")
                .passwordHash("hash")
                .role(role)
                .build());

        userPermissionRepository.save(UserPermission.builder()
                .user(user).permission(assigned).allowed(false).build());
        userPermissionRepository.saveAndFlush(UserPermission.builder()
                .user(user).permission(extra).allowed(true).build());
        entityManager.clear();

        assertThat(userPermissionRepository.findByUserId(user.getId())).hasSize(2);
        assertThat(userPermissionRepository.findByUserIdAndPermissionId(user.getId(), assigned.getId()))
                .get().extracting(UserPermission::isAllowed).isEqualTo(false);
        assertThat(userPermissionRepository.findByUserIdAndPermissionId(user.getId(), extra.getId()))
                .get().extracting(UserPermission::isAllowed).isEqualTo(true);
        assertThat(roleRepository.findById(role.getId()).orElseThrow().getPermissions())
                .extracting(Permission::getCode)
                .containsExactly("PAQUETE_CONSULTAR");

        userPermissionRepository.deleteByUserId(user.getId());
        userPermissionRepository.flush();
        entityManager.clear();
        assertThat(userPermissionRepository.findByUserId(user.getId())).isEmpty();
    }
}
