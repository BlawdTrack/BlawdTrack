package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageValidationResult;
import java.util.List;

/** Clasifica individualmente los paquetes extraídos de un archivo. */
public interface PackageRecordValidationService {

    PackageValidationResult validate(List<ImportedPackage> packageRecords);
}
