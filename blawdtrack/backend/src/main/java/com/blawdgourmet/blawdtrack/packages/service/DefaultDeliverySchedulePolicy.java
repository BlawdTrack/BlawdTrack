package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import org.springframework.stereotype.Component;

/** Aplica el horario operativo definido cuando Zoho no proporciona uno. */
@Component
public class DefaultDeliverySchedulePolicy implements DeliverySchedulePolicy {

    public static final String DEFAULT_SCHEDULE = "9:00 a.m. a 4:00 p.m.";

    @Override
    public ImportedPackage apply(ImportedPackage packageData) {
        if (packageData == null || !isBlank(packageData.schedule())) {
            return packageData;
        }
        return new ImportedPackage(
                packageData.shipmentNumber(),
                packageData.orderNumber(),
                packageData.customerName(),
                packageData.address(),
                packageData.phone(),
                DEFAULT_SCHEDULE,
                packageData.items()
        );
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
