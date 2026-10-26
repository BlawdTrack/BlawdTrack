package com.blawdgourmet.blawdtrack.users.service;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/** Ubica a un Administrador de Ventas por su tipo y número de documento. */
@Component
@RequiredArgsConstructor
public class AdminLookup {

    private final UserRepository userRepository;

    /**
     * @throws AdminNotFoundException si el documento no existe o pertenece a un usuario que no es Administrador de
     *                                Ventas ("Administrador no existente")
     */
    public User findSalesAdministrator(DocumentType documentType, String documentNumber) {
        return userRepository.findByDocumentTypeAndDocumentNumber(documentType, documentNumber)
                .filter(user -> user.getRole() != null
                        && RoleName.SALES_ADMIN.equals(user.getRole().getName()))
                .orElseThrow(() -> new AdminNotFoundException("Administrador no existente"));
    }
}
