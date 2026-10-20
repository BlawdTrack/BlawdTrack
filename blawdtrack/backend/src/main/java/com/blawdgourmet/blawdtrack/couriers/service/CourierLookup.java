package com.blawdgourmet.blawdtrack.couriers.service;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;

import lombok.RequiredArgsConstructor;

/** Ubica a un mensajero a partir del identificador que llega en la URL. */
@Component
@RequiredArgsConstructor
public class CourierLookup {

    private static final String NOT_FOUND = "Mensajero no encontrado";

    private final CourierRepository couriers;

    /**
     * Ubica al mensajero por id numérico o, si el texto no es un número, por número de documento.
     * Ojo: un documento formado solo por dígitos se interpreta primero como id.
     *
     * @throws CourierNotFoundException si el identificador está vacío o no corresponde a ningún mensajero
     */
    public Courier resolve(String id) {
        if (id == null || id.isBlank()) {
            throw new CourierNotFoundException(NOT_FOUND);
        }

        String normalized = id.trim();

        try {
            Long numericId = Long.valueOf(normalized);

            return couriers.findById(numericId)
                    .orElseThrow(() -> new CourierNotFoundException(NOT_FOUND));
        } catch (NumberFormatException ex) {
            return couriers.findByUserDocumentId(normalized)
                    .orElseThrow(() -> new CourierNotFoundException(NOT_FOUND));
        }
    }
}
