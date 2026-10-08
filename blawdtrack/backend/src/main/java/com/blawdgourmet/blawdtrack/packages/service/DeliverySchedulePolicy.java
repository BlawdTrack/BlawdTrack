package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;

/** Política para completar el horario de entrega de un paquete importado. */
public interface DeliverySchedulePolicy {

    ImportedPackage apply(ImportedPackage packageData);
}
