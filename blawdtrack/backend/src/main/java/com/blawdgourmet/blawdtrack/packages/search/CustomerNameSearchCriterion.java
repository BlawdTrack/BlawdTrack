package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.stereotype.Component;

@Component
public class CustomerNameSearchCriterion extends AbstractTextFieldSearchCriterion {

    public CustomerNameSearchCriterion() {
        super(PackageSearchFields.CUSTOMER_NAME);
    }
}