package com.blawdgourmet.blawdtrack.packages.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CompareShipmentNumbersRequest(
        @NotEmpty(message = "Debe proporcionar al menos un numero de envio")
        @Size(max = 1000, message = "No se pueden comparar mas de 1000 numeros de envio por solicitud")
        List<@NotBlank(message = "El numero de envio no puede estar vacio")
             @Size(max = 50, message = "El numero de envio no puede superar 50 caracteres") String> shipmentNumbers) {
}
