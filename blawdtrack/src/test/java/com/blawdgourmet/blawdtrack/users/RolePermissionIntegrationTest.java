package com.blawdgourmet.blawdtrack.users;

import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.auth.config.DataSeeder;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.PermissionCode;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.PermissionRepository;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:blawdtrack-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@Transactional
class RolePermissionIntegrationTest {
    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwt;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PermissionRepository permissions;
    @Autowired private EntityManager entityManager;
    @Autowired private DataSeeder seeder;

    private String token(String roleName) {
        var role = roles.findByName(roleName).orElseThrow();
        var user = users.saveAndFlush(User.builder()
                .documentType(DocumentType.CEDULA).documentNumber("RP-" + roleName).fullName("Prueba permisos")
                .email("rp-" + roleName + "@example.test").passwordHash("hash")
                .status(UserStatus.ACTIVE).role(role).build());
        return jwt.generateToken(new UserPrincipal(user));
    }

    private long permissionId(String code) {
        return permissions.findAll().stream().filter(p -> p.getCode().equals(code))
                .findFirst().orElseThrow().getId();
    }

    @Test
    void superUsuarioPuedeReemplazarPermisosYSePersisten() throws Exception {
        long roleId = roles.findByName(RoleName.COURIER).orElseThrow().getId();
        long permissionId = permissionId(PermissionCode.PACKAGE_VIEW_ASSIGNED);

        mvc.perform(put("/api/v1/roles/{roleId}/permissions", roleId)
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionIds\":[" + permissionId + "]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value(RoleName.COURIER))
                .andExpect(jsonPath("$.permissions[0]").value(PermissionCode.PACKAGE_VIEW_ASSIGNED));

        entityManager.clear();
        assertThat(roles.findById(roleId).orElseThrow().getPermissions())
                .extracting(p -> p.getCode()).containsExactly(PermissionCode.PACKAGE_VIEW_ASSIGNED);
    }

    @Test
    void rechazaPermisoAdministrativoSinCambiarRol() throws Exception {
        var role = roles.findByName(RoleName.COURIER).orElseThrow();
        long originalCount = role.getPermissions().size();
        mvc.perform(put("/api/v1/roles/{roleId}/permissions", role.getId())
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionIds\":[" + permissionId(PermissionCode.ROLE_ASSIGN) + "]}"))
                .andExpect(status().isForbidden());
        assertThat(role.getPermissions()).hasSize((int) originalCount);
    }

    @Test
    void permitePermisoOperativoDeAdministradorDeVentas() throws Exception {
        long roleId = roles.findByName(RoleName.SALES_ADMIN).orElseThrow().getId();
        long permissionId = permissionId(PermissionCode.REPORT_VIEW);

        mvc.perform(put("/api/v1/roles/{roleId}/permissions", roleId)
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionIds\":[" + permissionId + "]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.permissions[0]").value(PermissionCode.REPORT_VIEW));

        entityManager.clear();
        assertThat(roles.findById(roleId).orElseThrow().getPermissions())
                .extracting(p -> p.getCode()).containsExactly(PermissionCode.REPORT_VIEW);
    }

    @Test
    void listaVaciaRevocaTodosLosPermisosDelRolOperativo() throws Exception {
        long roleId = roles.findByName(RoleName.COURIER).orElseThrow().getId();

        mvc.perform(put("/api/v1/roles/{roleId}/permissions", roleId)
                        .header("Authorization", "Bearer " + token(RoleName.SUPER_USER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionIds\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.permissions").isEmpty());

        entityManager.clear();
        assertThat(roles.findById(roleId).orElseThrow().getPermissions()).isEmpty();
    }

    @Test
    void bloqueaMensajeroYSolicitudSinAutenticacion() throws Exception {
        long roleId = roles.findByName(RoleName.COURIER).orElseThrow().getId();
        String body = "{\"permissionIds\":[]}";
        mvc.perform(put("/api/v1/roles/{roleId}/permissions", roleId)
                        .header("Authorization", "Bearer " + token(RoleName.COURIER))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/v1/roles/{roleId}/permissions", roleId)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenAnteriorNoAutorizaAlUsuarioQuePerdioElRol() throws Exception {
        String bearer = "Bearer " + token(RoleName.SUPER_USER);
        var actor = users.findByEmail("rp-" + RoleName.SUPER_USER + "@example.test").orElseThrow();
        actor.setRole(roles.findByName(RoleName.COURIER).orElseThrow());
        users.saveAndFlush(actor);

        mvc.perform(put("/api/v1/roles/{roleId}/permissions",
                        roles.findByName(RoleName.COURIER).orElseThrow().getId())
                        .header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionIds\":[]}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void superUsuarioInactivoNoPuedeModificarPermisosAunqueConserveSuToken() throws Exception {
        String bearer = "Bearer " + token(RoleName.SUPER_USER);
        var actor = users.findByEmail("rp-" + RoleName.SUPER_USER + "@example.test").orElseThrow();
        actor.changeStatus(UserStatus.INACTIVE);
        users.saveAndFlush(actor);

        mvc.perform(put("/api/v1/roles/{roleId}/permissions",
                        roles.findByName(RoleName.COURIER).orElseThrow().getId())
                        .header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionIds\":[]}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void inicializadorConservaPermisosEditadosDelRolOperativo() throws Exception {
        var role = roles.findByName(RoleName.COURIER).orElseThrow();
        role.getPermissions().clear();
        roles.saveAndFlush(role);
        entityManager.clear();

        seeder.run();

        entityManager.clear();
        assertThat(roles.findByName(RoleName.COURIER).orElseThrow().getPermissions()).isEmpty();
    }

    @Test
    void validaIdsYNoPermiteEditarSuperUsuario() throws Exception {
        String bearer = "Bearer " + token(RoleName.SUPER_USER);
        long roleId = roles.findByName(RoleName.COURIER).orElseThrow().getId();
        mvc.perform(put("/api/v1/roles/{roleId}/permissions", roleId)
                        .header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/v1/roles/{roleId}/permissions", roleId)
                        .header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionIds\":[999999999]}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/v1/roles/{roleId}/permissions", 999999999)
                        .header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionIds\":[]}"))
                .andExpect(status().isNotFound());
        mvc.perform(put("/api/v1/roles/{roleId}/permissions",
                        roles.findByName(RoleName.SUPER_USER).orElseThrow().getId())
                        .header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"permissionIds\":[]}"))
                .andExpect(status().isForbidden());
    }
}
