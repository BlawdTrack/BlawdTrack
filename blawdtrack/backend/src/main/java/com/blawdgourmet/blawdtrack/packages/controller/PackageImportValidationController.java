package com.blawdgourmet.blawdtrack.packages.controller;

import com.blawdgourmet.blawdtrack.packages.dto.CompareShipmentNumbersRequest;
import com.blawdgourmet.blawdtrack.packages.dto.PackageImportPreviewResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageImportExecutionResponse;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberComparisonResponse;
import com.blawdgourmet.blawdtrack.packages.exception.InvalidPackageUploadException;
import com.blawdgourmet.blawdtrack.packages.service.PackageImportPreviewUseCase;
import com.blawdgourmet.blawdtrack.packages.service.PackageImportExecutionUseCase;
import com.blawdgourmet.blawdtrack.packages.service.ShipmentNumberComparisonService;
import com.blawdgourmet.blawdtrack.users.constant.PermissionCode;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageImportValidationController {

    private final ShipmentNumberComparisonService comparisonService;
    private final PackageImportPreviewUseCase importPreviewUseCase;
    private final PackageImportExecutionUseCase importExecutionUseCase;

    @PostMapping("/shipment-numbers/compare")
    @PreAuthorize("hasRole('" + RoleName.SALES_ADMIN + "')")
    public ShipmentNumberComparisonResponse compareShipmentNumbers(
            @Valid @RequestBody CompareShipmentNumbersRequest request) {
        return comparisonService.compare(request.shipmentNumbers());
    }

    @PostMapping(
            value = "/import/preview",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('" + PermissionCode.PACKAGE_IMPORT + "')")
    public PackageImportPreviewResponse previewImport(
            @RequestPart("file") MultipartFile file) {
        requireFile(file);
        try {
            return importPreviewUseCase.preview(
                    file.getInputStream(), file.getOriginalFilename());
        } catch (IOException exception) {
            throw new InvalidPackageUploadException(
                    "No se pudo abrir el archivo recibido", exception);
        }
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('" + RoleName.SALES_ADMIN + "')")
    public PackageImportExecutionResponse importPackages(
            @RequestPart("file") MultipartFile file) {
        requireFile(file);
        try {
            return importExecutionUseCase.execute(
                    file.getInputStream(), file.getOriginalFilename());
        } catch (IOException exception) {
            throw new InvalidPackageUploadException(
                    "No se pudo abrir el archivo recibido", exception);
        }
    }

    private void requireFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidPackageUploadException(
                    "El archivo es obligatorio y no puede estar vacío");
        }
    }
}
