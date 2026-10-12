package com.blawdgourmet.blawdtrack.packages.dto;

public record PackageSearchResponse(
        Long id,
        String shipmentNumber,
        String orderNumber,
        String customerName,
        String address,
        String phone,
        String schedule) {
}