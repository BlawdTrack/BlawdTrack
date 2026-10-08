package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.stereotype.Component;

@Component
public class OrderNumberSearchCriterion extends AbstractTextFieldSearchCriterion {

    public OrderNumberSearchCriterion() {
        super(PackageSearchFields.ORDER_NUMBER);
    }
}