package com.blawdgourmet.blawdtrack.packages.dto;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryWindow;
import com.fasterxml.jackson.annotation.JsonUnwrapped;

/**
 * Paquete válido tal como se muestra en la previsualización: los datos importados más el rango de entrega que
 * se le asignaría al registrarlo (HU-010). Los datos se serializan al mismo nivel que {@code deliveryWindow}.
 */
public record ValidPackagePreview(
        @JsonUnwrapped ImportedPackage packageData,
        DeliveryWindow deliveryWindow
) {
}
