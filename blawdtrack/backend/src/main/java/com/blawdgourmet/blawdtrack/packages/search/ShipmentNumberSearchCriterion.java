package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.stereotype.Component;

@Component
public class ShipmentNumberSearchCriterion extends AbstractTextFieldSearchCriterion {

    public ShipmentNumberSearchCriterion() {
        super(PackageSearchFields.SHIPMENT_NUMBER);
    }
}