package com.blawdgourmet.blawdtrack.packages.validation;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageValidationIssue;
import java.util.List;

/** Regla extensible de validación para un registro producido por el parser. */
public interface PackageRecordValidator {

    List<PackageValidationIssue> validate(ImportedPackage packageData);
}
