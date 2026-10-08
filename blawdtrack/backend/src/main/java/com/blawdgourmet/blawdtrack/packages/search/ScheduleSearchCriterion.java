package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.stereotype.Component;

@Component
public class ScheduleSearchCriterion extends AbstractTextFieldSearchCriterion {

    public ScheduleSearchCriterion() {
        super(PackageSearchFields.SCHEDULE);
    }
}