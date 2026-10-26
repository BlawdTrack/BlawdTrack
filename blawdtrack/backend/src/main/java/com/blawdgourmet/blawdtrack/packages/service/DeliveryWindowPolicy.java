package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryWindow;

/** Calcula horas persistibles a partir de la preferencia horaria importada. */
public interface DeliveryWindowPolicy {

    DeliveryWindow calculate(String schedule);
}
