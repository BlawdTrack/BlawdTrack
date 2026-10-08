package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.stereotype.Component;

@Component
public class AddressSearchCriterion extends AbstractTextFieldSearchCriterion {

    public AddressSearchCriterion() {
        super(PackageSearchFields.ADDRESS);
    }
}