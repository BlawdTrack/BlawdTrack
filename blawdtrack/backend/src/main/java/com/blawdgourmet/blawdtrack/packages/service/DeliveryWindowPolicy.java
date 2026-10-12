package com.blawdgourmet.blawdtrack.packages.service;

/** Calcula horas persistibles a partir de la preferencia horaria importada. */
public interface DeliveryWindowPolicy {

    DeliveryWindow calculate(String schedule);
}
