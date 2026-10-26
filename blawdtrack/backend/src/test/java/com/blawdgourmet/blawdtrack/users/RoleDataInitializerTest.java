package com.blawdgourmet.blawdtrack.users;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.users.bootstrap.RoleDataInitializer;
import com.blawdgourmet.blawdtrack.users.constant.PermissionCode;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.constant.RolePermissionDefaults;
import com.blawdgourmet.blawdtrack.users.repository.PermissionRepository;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;

import jakarta.persistence.EntityManager;

/** HU-009: permisos predeterminados de los roles operativos y su conservación entre reinicios. */
@SpringBootTest
@Transactional
class RoleDataInitializerTest {

    @Autowired private RoleDataInitializer initializer;
    @Autowired private RoleRepository roles;
    @Autowired private PermissionRepository permissions;
    @Autowired private EntityManager entityManager;

    private Set<String> codesOf(String roleName) {
        entityManager.flush();
        entityManager.clear();
        return roles.findByName(roleName).orElseThrow().getPermissions().stream()
                .map(permission -> permission.getCode()).collect(Collectors.toSet());
    }

    @Test
    void losRolesOperativosNacenConSusPermisosPredeterminados() {
        assertThat(codesOf(RoleName.COURIER))
                .containsExactlyInAnyOrder(PermissionCode.PACKAGE_VIEW_ASSIGNED,
                        PermissionCode.PACKAGE_UPDATE_STATUS, PermissionCode.TRIP_COST_REGISTER);
        assertThat(codesOf(RoleName.SALES_ADMIN))
                .isEqualTo(RolePermissionDefaults.forRole(RoleName.SALES_ADMIN).orElseThrow())
                .doesNotContain(PermissionCode.USER_CREATE, PermissionCode.PACKAGE_UPDATE_STATUS,
                        PermissionCode.TRIP_COST_REGISTER);
    }

    @Test
    void reiniciarNoSobrescribeLasEdicionesDelSuperUsuario() throws Exception {
        var courier = roles.findByName(RoleName.COURIER).orElseThrow();
        courier.getPermissions().removeIf(p -> p.getCode().equals(PermissionCode.TRIP_COST_REGISTER));
        roles.saveAndFlush(courier);

        initializer.run();

        assertThat(codesOf(RoleName.COURIER)).doesNotContain(PermissionCode.TRIP_COST_REGISTER)
                .hasSize(2);
    }

    @Test
    void reiniciarRetiraLosPermisosQueQuedaronFueraDelAlcanceDelRol() throws Exception {
        var admin = roles.findByName(RoleName.SALES_ADMIN).orElseThrow();
        admin.getPermissions().add(permissions.findByCode(PermissionCode.USER_CREATE).orElseThrow());
        admin.getPermissions().add(permissions.findByCode(PermissionCode.TRIP_COST_REGISTER).orElseThrow());
        roles.saveAndFlush(admin);

        initializer.run();

        assertThat(codesOf(RoleName.SALES_ADMIN))
                .doesNotContain(PermissionCode.USER_CREATE, PermissionCode.TRIP_COST_REGISTER)
                .isEqualTo(RolePermissionDefaults.forRole(RoleName.SALES_ADMIN).orElseThrow());
    }
}
