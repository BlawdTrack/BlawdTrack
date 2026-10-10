package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageBulkRegistrationResult;
import java.util.List;

/** Puerto de entrada para persistir un lote que ya superó las validaciones. */
public interface PackageBulkRegistrationUseCase {

    PackageBulkRegistrationResult registerValidPackages(List<ImportedPackage> validPackages);
}
