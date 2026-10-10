package com.blawdgourmet.blawdtrack.packages.service;

import java.util.List;

import com.blawdgourmet.blawdtrack.packages.dto.PackageHistoryEntry;

/**
 * Servicio para consultar el historial de cambios de estado de un paquete.
 */
public interface PackageHistoryService {

    /**
     * Obtiene el historial cronológico de cambios de estado de un paquete.
     *
     * @param shipmentNumber número de envío del paquete
     * @return lista ordenada cronológicamente (más antiguo primero)
     * @throws PackageNotFoundException si no existe un paquete con ese número de envío
     */
    List<PackageHistoryEntry> getHistoryByShipmentNumber(String shipmentNumber);
}