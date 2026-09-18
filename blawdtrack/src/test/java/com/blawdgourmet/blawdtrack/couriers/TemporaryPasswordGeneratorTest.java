package com.blawdgourmet.blawdtrack.couriers;

import com.blawdgourmet.blawdtrack.couriers.service.TemporaryPasswordGenerator;
import java.util.HashSet;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class TemporaryPasswordGeneratorTest {
    @Test
    void generaClavesDistintasConTodosLosGruposYCompatiblesConBcrypt() {
        var generator = new TemporaryPasswordGenerator();
        var passwords = new HashSet<String>();
        for (int i = 0; i < 1000; i++) {
            String password = generator.generate();
            assertThat(password).hasSize(20).matches("[A-Za-z0-9!@#$%&*+_\\-]+")
                    .containsPattern("[A-Z]").containsPattern("[a-z]")
                    .containsPattern("[0-9]").containsPattern("[!@#$%&*+_\\-]");
            assertThat(passwords.add(password)).isTrue();
        }
    }
}
