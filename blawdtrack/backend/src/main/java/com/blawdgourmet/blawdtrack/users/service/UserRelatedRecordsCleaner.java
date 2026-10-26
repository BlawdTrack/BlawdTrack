package com.blawdgourmet.blawdtrack.users.service;

import java.util.List;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.repository.UserPermissionRepository;

import lombok.RequiredArgsConstructor;

/**
 * Deja libre a un usuario de los registros que lo referencian con clave foránea, para poder
 * eliminarlo. Borra los permisos propios de `users` y le pide a cada {@link UserDataPurger} (auth, audit...)
 * que limpie lo suyo. La auditoría no se borra: solo se desvincula del usuario afectado.
 */
@Component
@RequiredArgsConstructor
public class UserRelatedRecordsCleaner {

    private final List<UserDataPurger> purgers;
    private final UserPermissionRepository userPermissions;

    public void removeFor(Long userId) {
        purgers.forEach(purger -> purger.purgeFor(userId));
        userPermissions.deleteByUserId(userId);
    }
}
