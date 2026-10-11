package com.blawdgourmet.blawdtrack.packages.controller;

import com.blawdgourmet.blawdtrack.packages.dto.CompareShipmentNumbersRequest;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberComparisonResponse;
import com.blawdgourmet.blawdtrack.packages.service.ShipmentNumberComparisonService;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageImportValidationController {

    private final ShipmentNumberComparisonService comparisonService;

    @PostMapping("/shipment-numbers/compare")
    @PreAuthorize("hasAnyRole('" + RoleName.SALES_ADMIN + "', '" + RoleName.SUPER_USER + "')")
    public ShipmentNumberComparisonResponse compareShipmentNumbers(
            @Valid @RequestBody CompareShipmentNumbersRequest request) {
        return comparisonService.compare(request.shipmentNumbers());
    }
}
