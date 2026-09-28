package com.blawdgourmet.blawdtrack.users.service;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.users.constant.PermissionCode;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.RolePermissionsResponse;
import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.repository.PermissionRepository;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RolePermissionService {
    private static final Map<String, Set<String>> OPERATIONAL_PERMISSIONS = Map.of(
            RoleName.SALES_ADMIN, Set.of(
                    PermissionCode.PACKAGE_IMPORT, PermissionCode.PACKAGE_DELETE,
                    PermissionCode.PACKAGE_VIEW, PermissionCode.PACKAGE_SEARCH,
                    PermissionCode.PACKAGE_EXPORT, PermissionCode.PACKAGE_GENERATE_QR,
                    PermissionCode.PACKAGE_ASSIGN, PermissionCode.REPORT_VIEW,
                    PermissionCode.REPORT_PRINT, PermissionCode.PROOF_OF_DELIVERY_VIEW,
                    PermissionCode.COST_VIEW),
            RoleName.COURIER, Set.of(
                    PermissionCode.PACKAGE_VIEW_ASSIGNED,
                    PermissionCode.PACKAGE_UPDATE_STATUS,
                    PermissionCode.TRIP_COST_REGISTER));

    private final RoleRepository roles;
    private final PermissionRepository permissions;
    private final UserRepository users;

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
        Set<String> allowed = OPERATIONAL_PERMISSIONS.get(role.getName());
        if (allowed == null) {
            throw new RolePermissionException(HttpStatus.FORBIDDEN,
                    "This role does not accept permission changes");
        }
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
