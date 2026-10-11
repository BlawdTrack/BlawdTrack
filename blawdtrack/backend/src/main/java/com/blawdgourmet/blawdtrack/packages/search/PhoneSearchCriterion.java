package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.stereotype.Component;

@Component
public class PhoneSearchCriterion extends AbstractTextFieldSearchCriterion {

    public PhoneSearchCriterion() {
        super(PackageSearchFields.PHONE);
    }

}