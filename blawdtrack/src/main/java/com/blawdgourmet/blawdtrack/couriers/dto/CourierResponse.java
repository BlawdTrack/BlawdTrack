package com.blawdgourmet.blawdtrack.couriers.dto;

import java.math.BigDecimal;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

public record CourierResponse(Long id, Long userId, DocumentType documentType, String documentNumber,
                              String fullName, String email, String phone, String schedule,
                              BigDecimal maxPackageWeightKg, UserStatus status, String role) {
    public static CourierResponse from(Courier courier) {
        var user = courier.getUser();
        return new CourierResponse(courier.getId(), user.getId(), user.getDocumentType(), user.getDocumentNumber(),
                user.getFullName(), user.getEmail(), user.getPhone(), courier.getSchedule(),
                courier.getMaxPackageWeightKg(), user.getStatus(), user.getRole().getName());
    }
}
