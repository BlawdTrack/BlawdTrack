package com.blawdgourmet.blawdtrack.users.service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.constant.RolePermissionDefaults;
import com.blawdgourmet.blawdtrack.users.dto.RolePermissionsResponse;
import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.repository.PermissionRepository;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Matriz de permisos por rol (HU-009). Solo los roles operativos (administrador de ventas y mensajero)
 * se pueden editar, y cada uno solo puede recibir permisos de su propio alcance; el Super Usuario no es
 * editable. Los cambios aplican en la siguiente solicitud de los usuarios de ese rol.
 */
@Service
@RequiredArgsConstructor
public class RolePermissionService {
    private final RoleRepository roles;
    private final PermissionRepository permissions;
    private final UserRepository users;

    /**
     * Reemplaza el conjunto completo de permisos de un rol. Además de exigir el rol Super Usuario,
     * confirma en la base que el actor siga activo y con ese rol, porque su JWT puede ser anterior a un
     * cambio.
     *
     * @param roleId        id del rol a modificar
     * @param permissionIds ids de los permisos que el rol tendrá; una lista vacía los revoca todos
     * @throws RolePermissionException 404 si el rol no existe, 403 si el rol no es editable o si pide
     *                                 permisos fuera de su alcance, 400 si algún permiso no existe
     */
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public RolePermissionsResponse replace(Long roleId, Set<Long> permissionIds) {
        // El JWT puede conservar un rol anterior: confirmar el estado actual en la base.
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var actor = users.findByEmail(email).orElseThrow(() -> new AccessDeniedException("Access denied"));
        if (!actor.isActive() || !RoleName.SUPER_USER.equals(actor.getRole().getName())) {
            throw new AccessDeniedException("Access denied");
        }

        var role = roles.findById(roleId).orElseThrow(() ->
                new RolePermissionException(HttpStatus.NOT_FOUND, "Role not found"));
        Set<String> allowed = RolePermissionDefaults.forRole(role.getName()).orElseThrow(() ->
                new RolePermissionException(HttpStatus.FORBIDDEN,
                        "This role does not accept permission changes"));
        Set<Permission> selected = new HashSet<>(permissions.findAllById(permissionIds));
        if (selected.size() != permissionIds.size()) {
            throw new RolePermissionException(HttpStatus.BAD_REQUEST, "One or more permissions do not exist");
        }
        if (selected.stream().anyMatch(p -> !allowed.contains(p.getCode()))) {
            throw new RolePermissionException(HttpStatus.FORBIDDEN,
                    "The role is requesting permissions outside its scope");
        }
        role.setPermissions(selected);
        roles.saveAndFlush(role);
        return new RolePermissionsResponse(role.getId(), role.getName(), selected.stream()
                .map(Permission::getCode).collect(Collectors.toUnmodifiableSet()));
    }
}
