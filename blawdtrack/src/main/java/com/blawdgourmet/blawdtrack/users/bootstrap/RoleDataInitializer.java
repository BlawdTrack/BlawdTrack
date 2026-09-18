package com.blawdgourmet.blawdtrack.users.bootstrap;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.constant.PermissionCode;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.repository.PermissionRepository;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RoleDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public void run(String... args) {
        ensurePermission(PermissionCode.USER_CREATE, "Crear usuarios");
        ensurePermission(PermissionCode.USER_UPDATE, "Actualizar usuarios");
        ensurePermission(PermissionCode.USER_DEACTIVATE, "Desactivar usuarios");
        ensurePermission(PermissionCode.USER_DELETE, "Eliminar usuarios");
        ensurePermission(PermissionCode.ROLE_ASSIGN, "Asignar roles");

        ensurePermission(PermissionCode.PACKAGE_IMPORT, "Importar paquetes");
        ensurePermission(PermissionCode.PACKAGE_DELETE, "Eliminar paquetes");
        ensurePermission(PermissionCode.PACKAGE_VIEW, "Consultar paquetes");
        ensurePermission(PermissionCode.PACKAGE_SEARCH, "Buscar paquetes");
        ensurePermission(PermissionCode.PACKAGE_EXPORT, "Exportar paquetes");
        ensurePermission(PermissionCode.PACKAGE_GENERATE_QR, "Generar QR de paquetes");
        ensurePermission(PermissionCode.PACKAGE_ASSIGN, "Asignar paquetes");
        ensurePermission(PermissionCode.PACKAGE_VIEW_ASSIGNED, "Consultar paquetes asignados");
        ensurePermission(PermissionCode.PACKAGE_UPDATE_STATUS, "Actualizar estado de paquetes");
        ensurePermission(PermissionCode.TRIP_COST_REGISTER, "Registrar costo de viaje");

        ensurePermission(PermissionCode.REPORT_VIEW, "Consultar reportes");
        ensurePermission(PermissionCode.REPORT_PRINT, "Imprimir reportes");
        ensurePermission(PermissionCode.PROOF_OF_DELIVERY_VIEW, "Consultar comprobantes");
        ensurePermission(PermissionCode.COST_VIEW, "Consultar costos");

        ensureRole(RoleName.SUPER_USER, "Super Usuario",
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
                PermissionCode.COST_VIEW);

        ensureRole(RoleName.SALES_ADMIN, "Administrador de Ventas",
                PermissionCode.USER_CREATE,
                PermissionCode.USER_UPDATE,
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
                PermissionCode.COST_VIEW);

        ensureRole(RoleName.COURIER, "Mensajero",
                PermissionCode.PACKAGE_VIEW,
                PermissionCode.PACKAGE_SEARCH,
                PermissionCode.PACKAGE_VIEW_ASSIGNED,
                PermissionCode.PACKAGE_UPDATE_STATUS,
                PermissionCode.PROOF_OF_DELIVERY_VIEW,
                PermissionCode.COST_VIEW);
    }

    private void ensurePermission(String code, String description) {
        permissionRepository.findByCode(code).orElseGet(() -> permissionRepository.save(
                Permission.builder().code(code).description(description).build()));
    }

    private void ensureRole(String roleName, String description, String... permissionCodes) {
        Role role = roleRepository.findByName(roleName).orElseGet(() -> roleRepository.save(
                Role.builder().name(roleName).description(description).build()));

        Set<Permission> permissions = Arrays.stream(permissionCodes)
                .map(code -> permissionRepository.findByCode(code)
                        .orElseThrow(() -> new IllegalStateException("Permission not found: " + code)))
                .collect(Collectors.toCollection(HashSet::new));

        role.setPermissions(permissions);
        roleRepository.save(role);
    }
}
