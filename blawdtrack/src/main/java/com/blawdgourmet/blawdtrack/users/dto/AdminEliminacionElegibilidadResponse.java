package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.model.UserStatus;

public record AdminEliminacionElegibilidadResponse(
        Long id,
        String cedulaIdentidad,
        String nombreCompleto,
        UserStatus estado,
        boolean tieneSesionActiva,
        boolean elegibleParaEliminar,
        String motivoNoElegible
) {
}