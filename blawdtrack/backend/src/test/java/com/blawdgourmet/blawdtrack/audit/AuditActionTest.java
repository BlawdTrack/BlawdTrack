package com.blawdgourmet.blawdtrack.audit;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditCategory;

class AuditActionTest {

    @Test
    void courierHistoryGroupsTheCourierActions() {
        assertThat(AuditAction.codesOf(AuditCategory.COURIER)).containsExactly(
                "CREAR_MENSAJERO", "ACTUALIZAR_MENSAJERO", "DESACTIVAR_MENSAJERO", "ACTIVAR_MENSAJERO",
                "CAMBIAR_CONTRASENA_MENSAJERO");
    }

    @Test
    void adminHistoryIncludesTheDeletion() {
        assertThat(AuditAction.codesOf(AuditCategory.ADMIN)).containsExactly(
                "CREAR_ADMINISTRADOR", "ACTUALIZAR_ADMINISTRADOR", "DESACTIVAR_ADMINISTRADOR",
                "ACTIVAR_ADMINISTRADOR", "CAMBIAR_CONTRASENA_ADMINISTRADOR", "ELIMINAR_ADMINISTRADOR");
    }

    @Test
    void packageHistoryGroupsThePackageActions() {
        assertThat(AuditAction.codesOf(AuditCategory.PACKAGE)).containsExactly(
                "REGISTRAR_PAQUETE", "ELIMINAR_PAQUETE", "CAMBIAR_ESTADO_PAQUETE", "ASIGNAR_PAQUETE",
                "DESASIGNAR_PAQUETE");
    }

    @Test
    void everyActionBelongsToExactlyOneCategoryAndCodesAreUnique() {
        List<String> all = Arrays.stream(AuditCategory.values())
                .flatMap(category -> AuditAction.codesOf(category).stream())
                .toList();

        assertThat(all).hasSameSizeAs(AuditAction.values()).doesNotHaveDuplicates();
        assertThat(new HashSet<>(all)).isEqualTo(
                new HashSet<>(Arrays.stream(AuditAction.values()).map(AuditAction::getCode).toList()));
    }
}
