package com.blawdgourmet.blawdtrack.audit;

import com.blawdgourmet.blawdtrack.audit.service.ChangeSet;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ChangeSetTest {

    @Test
    void sinLlamadasEstaVacio() {
        var changes = new ChangeSet();

        assertThat(changes.isEmpty()).isTrue();
        assertThat(changes.changedFields()).isEmpty();
        assertThat(changes.describe()).isEmpty();
    }

    @Test
    void valorIgualNoSeRegistra() {
        var changes = new ChangeSet().track("fullName", "Ana", "Ana");

        assertThat(changes.isEmpty()).isTrue();
    }

    @Test
    void valorDistintoSeRegistra() {
        var changes = new ChangeSet().track("fullName", "Ana", "Luisa");

        assertThat(changes.isEmpty()).isFalse();
        assertThat(changes.changedFields()).containsExactly("fullName");
    }

    @Test
    void nuloContraNuloNoSeRegistra() {
        var changes = new ChangeSet().track("phone", null, null);

        assertThat(changes.isEmpty()).isTrue();
    }

    @Test
    void nuloAValorSeRegistra() {
        var changes = new ChangeSet().track("phone", null, "70000000");

        assertThat(changes.changedFields()).containsExactly("phone");
    }

    @Test
    void valorANuloSeRegistra() {
        var changes = new ChangeSet().track("phone", "70000000", null);

        assertThat(changes.changedFields()).containsExactly("phone");
    }

    @Test
    void bigDecimalConIgualValorNumericoNoSeRegistra() {
        var changes = new ChangeSet()
                .track("maxPackageWeightKg", new BigDecimal("25.5"), new BigDecimal("25.50"));

        assertThat(changes.isEmpty()).isTrue();
    }

    @Test
    void bigDecimalConDistintoValorNumericoSeRegistra() {
        var changes = new ChangeSet()
                .track("maxPackageWeightKg", new BigDecimal("25.50"), new BigDecimal("40.75"));

        assertThat(changes.changedFields()).containsExactly("maxPackageWeightKg");
    }

    @Test
    void conservaElOrdenDeInsercion() {
        var changes = new ChangeSet()
                .track("fullName", "a", "b")
                .track("email", "x", "x")
                .track("schedule", "c", "d");

        assertThat(changes.changedFields()).containsExactly("fullName", "schedule");
        assertThat(changes.describe()).isEqualTo("fullName, schedule");
    }

    @Test
    void mismoCampoDosVecesApareceUnaVez() {
        var changes = new ChangeSet()
                .track("phone", "1", "2")
                .track("phone", "3", "4");

        assertThat(changes.changedFields()).containsExactly("phone");
        assertThat(changes.describe()).isEqualTo("phone");
    }

    @Test
    void describeNoContieneLosValores() {
        var changes = new ChangeSet().track("passwordHash", "hash-secreto", "hash-nuevo");

        assertThat(changes.describe()).doesNotContain("hash-secreto").doesNotContain("hash-nuevo");
    }

    @Test
    void changedFieldsEsInmodificable() {
        var changes = new ChangeSet().track("phone", "1", "2");

        assertThatThrownBy(() -> changes.changedFields().add("otro"))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t"})
    void campoNuloOEnBlancoLanzaIllegalArgumentException(String field) {
        var changes = new ChangeSet();

        assertThatThrownBy(() -> changes.track(field, "a", "b"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
