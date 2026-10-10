package com.blawdgourmet.blawdtrack.packages.service;

import java.util.List;

import com.blawdgourmet.blawdtrack.packages.dto.PackageHistoryEntry;

/**
 * Consulta el historial cronológico de eventos de un paquete.
 */
public interface PackageHistoryService {

    List<PackageHistoryEntry> getHistoryByShipmentNumber(String shipmentNumber);
}
