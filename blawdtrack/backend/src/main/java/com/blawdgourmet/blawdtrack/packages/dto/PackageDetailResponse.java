package com.blawdgourmet.blawdtrack.packages.dto;

import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Respuesta con el detalle completo de un paquete/envío.
 * Incluye: datos generales, cliente, entrega y mensajero asignado.
 */
public record PackageDetailResponse(
        // Datos generales
        Long id,
        String shipmentNumber,
        String description,
        BigDecimal weightKg,
        BigDecimal lengthCm,
        BigDecimal widthCm,
        BigDecimal heightCm,
        PackageStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,

        // Datos del cliente
        String clientName,
        String clientDocument,
        String clientPhone,
        String clientEmail,
        String clientAddress,

        // Datos de entrega
        String deliveryAddress,
        String deliveryCity,
        String deliveryReference,
        LocalDateTime scheduledDeliveryDate,
        LocalDateTime actualDeliveryDate,
        String deliveryNotes,
        String recipientSignature,

        // Mensajero asignado
        AssignedCourierInfo assignedCourier,

        // Administrador de ventas que creó el paquete
        CreatedByInfo createdBy
) {

    /**
     * Información del mensajero asignado.
     */
    public record AssignedCourierInfo(
            Long courierId,
            Long userId,
            DocumentType documentType,
            String documentNumber,
            String fullName,
            String email,
            String phone,
            String schedule,
            BigDecimal maxPackageWeightKg,
            UserStatus status,
            String role
    ) {}

    /**
     * Información del administrador de ventas que creó el paquete.
     */
    public record CreatedByInfo(
            Long userId,
            DocumentType documentType,
            String documentNumber,
            String fullName,
            String email,
            String role
    ) {}
}