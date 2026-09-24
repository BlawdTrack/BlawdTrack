package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

public record AdminEliminacionElegibilidadResponse(
        Long id,
        DocumentType documentType,
        String documentNumber,
        String fullName,
        UserStatus status,
        boolean tieneSesionActiva,
        boolean elegibleParaEliminar,
        String motivoNoElegible
) {
}
