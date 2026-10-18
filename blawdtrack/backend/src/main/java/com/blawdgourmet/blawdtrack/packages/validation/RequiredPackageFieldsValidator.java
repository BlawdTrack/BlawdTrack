package com.blawdgourmet.blawdtrack.packages.validation;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageValidationIssue;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import org.springframework.stereotype.Component;

/** Valida exclusivamente los campos obligatorios definidos por HU010. */
@Component
public class RequiredPackageFieldsValidator implements PackageRecordValidator {

    private static final List<RequiredField> REQUIRED_FIELDS = List.of(
            new RequiredField("shipmentNumber", "número de envío", ImportedPackage::shipmentNumber),
            new RequiredField("orderNumber", "número de orden", ImportedPackage::orderNumber),
            new RequiredField("customerName", "nombre del cliente", ImportedPackage::customerName),
            new RequiredField("address", "dirección de entrega", ImportedPackage::address),
            new RequiredField("phone", "teléfono", ImportedPackage::phone)
    );

    @Override
    public List<PackageValidationIssue> validate(ImportedPackage packageData) {
        List<PackageValidationIssue> issues = new ArrayList<>();
        for (RequiredField requiredField : REQUIRED_FIELDS) {
            String value = packageData == null ? null : requiredField.value().apply(packageData);
            if (isBlank(value)) {
                issues.add(new PackageValidationIssue(
                        requiredField.field(),
                        "El campo " + requiredField.label() + " es obligatorio"
                ));
            }
        }
        return List.copyOf(issues);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record RequiredField(
            String field,
            String label,
            Function<ImportedPackage, String> value
    ) {
    }
}
