package com.blawdgourmet.blawdtrack.users.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.constant.RolePermissionDefaults;
import com.blawdgourmet.blawdtrack.users.dto.UserPermissionsResponse;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserPermission;
import com.blawdgourmet.blawdtrack.users.repository.PermissionRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserPermissionRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import com.blawdgourmet.blawdtrack.users.validation.DocumentNormalizer;

import lombok.RequiredArgsConstructor;

/**
 * Permisos individuales de un usuario (HU-009). Se guardan como excepciones sobre los permisos de su
 * rol principal: conceder uno que el rol no tiene o revocar uno que sí tiene. Las excepciones solo
 * pueden moverse dentro del alcance del rol y se aplican en la siguiente solicitud del usuario,
 * porque sus autoridades se reconstruyen desde la base en cada petición.
 */
@Service
@RequiredArgsConstructor
public class UserPermissionService {

    private final UserRepository users;
    private final PermissionRepository permissions;
    private final UserPermissionRepository userPermissions;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public UserPermissionsResponse get(DocumentType documentType, String documentNumber) {
        User user = find(documentType, documentNumber);
        return response(user, userPermissions.findWithPermissionByUserId(user.getId()));
    }

    /** {@code permissionCodes} es el conjunto deseado de permisos efectivos del usuario. */
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public UserPermissionsResponse replace(DocumentType documentType, String documentNumber,
                                           Set<String> permissionCodes, AuthenticatedUser actor) {
        User user = find(documentType, documentNumber);
        Set<String> scope = scopeOf(user);

        Map<String, Permission> catalog = permissions.findAll().stream()
                .collect(Collectors.toMap(Permission::getCode, permission -> permission));
        if (!catalog.keySet().containsAll(permissionCodes)) {
            throw new RolePermissionException(HttpStatus.BAD_REQUEST, "One or more permissions do not exist");
        }
        if (!scope.containsAll(permissionCodes)) {
            throw new RolePermissionException(HttpStatus.FORBIDDEN,
                    "The user is requesting permissions outside the scope of their role");
        }

        Set<String> roleCodes = roleCodes(user);
        Set<String> granted = difference(permissionCodes, roleCodes);
        Set<String> revoked = difference(roleCodes, permissionCodes);

        List<UserPermission> previous = userPermissions.findWithPermissionByUserId(user.getId());
        if (overrideKeys(previous).equals(overrideKeys(granted, revoked))) {
            return response(user, previous);
        }

        userPermissions.deleteByUserId(user.getId());
        userPermissions.flush();
        List<UserPermission> overrides = new ArrayList<>();
        granted.forEach(code -> overrides.add(
                UserPermission.builder().user(user).permission(catalog.get(code)).allowed(true).build()));
        revoked.forEach(code -> overrides.add(
                UserPermission.builder().user(user).permission(catalog.get(code)).allowed(false).build()));
        userPermissions.saveAllAndFlush(overrides);

        auditService.logAction(AuditAction.USER_PERMISSIONS_UPDATED, actor, user,
                "granted=" + sorted(granted) + "; revoked=" + sorted(revoked));
        return response(user, overrides);
    }

    /** Elimina las excepciones del usuario: vuelve a los permisos predeterminados de su rol. */
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public UserPermissionsResponse reset(DocumentType documentType, String documentNumber,
                                         AuthenticatedUser actor) {
        User user = find(documentType, documentNumber);
        scopeOf(user);

        if (!userPermissions.findWithPermissionByUserId(user.getId()).isEmpty()) {
            userPermissions.deleteByUserId(user.getId());
            userPermissions.flush();
            auditService.logAction(AuditAction.USER_PERMISSIONS_RESET, actor, user,
                    "role=" + user.getRole().getName());
        }
        return response(user, List.of());
    }

    private User find(DocumentType documentType, String documentNumber) {
        String normalized = DocumentNormalizer.normalize(documentType, documentNumber);
        return users.findByDocumentTypeAndDocumentNumber(documentType, normalized)
                .orElseThrow(() -> new UserNotFoundException("Usuario no existente"));
    }

    private Set<String> scopeOf(User user) {
        return RolePermissionDefaults.forRole(user.getRole().getName()).orElseThrow(() ->
                new RolePermissionException(HttpStatus.FORBIDDEN, "This role does not accept permission changes"));
    }

    private Set<String> roleCodes(User user) {
        return user.getRole().getPermissions().stream().map(Permission::getCode)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private UserPermissionsResponse response(User user, List<UserPermission> overrides) {
        Set<String> role = roleCodes(user);
        Set<String> effective = new HashSet<>(role);
        overrides.forEach(override -> {
            if (override.isAllowed()) {
                effective.add(override.getPermission().getCode());
            } else {
                effective.remove(override.getPermission().getCode());
            }
        });
        Set<String> scope = RolePermissionDefaults.forRole(user.getRole().getName()).orElse(Set.of());
        return new UserPermissionsResponse(user.getId(), user.getDocumentType(), user.getDocumentNumber(),
                user.getFullName(), user.getRole().getName(), !scope.isEmpty(), !overrides.isEmpty(),
                new TreeSet<>(role), new TreeSet<>(effective), new TreeSet<>(scope));
    }

    private static Set<String> difference(Set<String> left, Set<String> right) {
        Set<String> result = new HashSet<>(left);
        result.removeAll(right);
        return result;
    }

    private static Set<String> overrideKeys(List<UserPermission> overrides) {
        return overrides.stream().map(o -> o.getPermission().getCode() + ":" + o.isAllowed())
                .collect(Collectors.toSet());
    }

    private static Set<String> overrideKeys(Set<String> granted, Set<String> revoked) {
        Set<String> keys = granted.stream().map(code -> code + ":true").collect(Collectors.toCollection(HashSet::new));
        revoked.forEach(code -> keys.add(code + ":false"));
        return keys;
    }

    private static List<String> sorted(Set<String> codes) {
        return codes.stream().sorted().toList();
    }
}
