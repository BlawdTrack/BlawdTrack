package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.model.UserStatus;

/**
 * Proyección de solo lectura con lo mínimo necesario para decidir si la sesión de
 * un usuario sigue vigente: su estado y la versión de sus tokens.
 */
public interface UserSessionState {

    UserStatus getStatus();

    int getTokenVersion();
}
