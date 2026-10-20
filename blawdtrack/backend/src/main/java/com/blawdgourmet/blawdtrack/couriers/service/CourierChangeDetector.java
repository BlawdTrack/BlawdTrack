package com.blawdgourmet.blawdtrack.couriers.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.couriers.dto.UpdateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.users.model.User;

/**
 * Compara los datos actuales de un mensajero con los de una actualización y dice cuáles cambian. Solo devuelve
 * nombres de campos, nunca valores: el historial no guarda datos personales.
 */
@Component
public class CourierChangeDetector {

    /**
     * @return los nombres de los campos que cambian, separados por coma; vacío si nada cambia
     */
    public String changedFields(User user, Courier courier, UpdateCourierRequest request) {
        List<String> fields = new ArrayList<>();

        if (!sameValue(user.getFullName(), request.fullName())) {
            fields.add("fullName");
        }
        if (!sameValue(user.getEmail(), request.email())) {
            fields.add("email");
        }
        if (!sameValue(user.getPhone(), request.phone())) {
            fields.add("phone");
        }
        if (!sameValue(courier.getSchedule(), request.schedule())) {
            fields.add("schedule");
        }
        if (!sameValue(courier.getMaxPackageWeightKg(), request.maxPackageWeightKg())) {
            fields.add("maxPackageWeightKg");
        }

        return String.join(", ", fields);
    }

    private boolean sameValue(Object left, Object right) {
        if (left == null && right == null) {
            return true;
        }

        if (left == null || right == null) {
            return false;
        }

        if (left instanceof BigDecimal leftDecimal
                && right instanceof BigDecimal rightDecimal) {
            return leftDecimal.compareTo(rightDecimal) == 0;
        }

        if (left instanceof BigDecimal leftDecimal
                && right instanceof String rightText) {
            return leftDecimal.compareTo(new BigDecimal(rightText)) == 0;
        }

        if (left instanceof String leftText
                && right instanceof BigDecimal rightDecimal) {
            return new BigDecimal(leftText).compareTo(rightDecimal) == 0;
        }

        return left.equals(right);
    }
}
