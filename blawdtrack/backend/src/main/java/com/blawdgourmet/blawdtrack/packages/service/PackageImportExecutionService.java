package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.PackageBulkRegistrationResult;
import com.blawdgourmet.blawdtrack.packages.dto.PackageImportExecutionResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageImportPreviewResponse;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

/** Reutiliza el flujo de T265 y entrega al registrador únicamente sus registros importables. */
@Service
@RequiredArgsConstructor
public class PackageImportExecutionService implements PackageImportExecutionUseCase {

    private final PackageImportPreviewUseCase previewUseCase;
    private final PackageBulkRegistrationUseCase bulkRegistrationUseCase;

    @Override
    @PreAuthorize("hasRole('" + RoleName.SALES_ADMIN + "')")
    public PackageImportExecutionResponse execute(InputStream input, String fileName) {
        PackageImportPreviewResponse preview = previewUseCase.preview(input, fileName);
        PackageBulkRegistrationResult registration =
                bulkRegistrationUseCase.registerValidPackages(preview.validRecords());

        return new PackageImportExecutionResponse(
                preview.fileName(),
                preview.totalRecords(),
                registration.registeredCount(),
                preview.invalidRecordsCount(),
                preview.duplicateRecordsCount(),
                registration.registeredShipmentNumbers()
        );
    }
}
