package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

/**
 * V23 convierte el estado de los paquetes de texto en español (V19, develop) al enum PackageStatus. Se migra hasta la
 * V22 con paquetes en cada estado antiguo y luego se aplica el resto, como le pasa a una base que ya tenía datos.
 */
class PackageStatusDataMigrationTest {

    private static final Map<String, String> EXPECTED = Map.of(
            "PENDIENTE", "PENDING",
            "ASIGNADO", "ASSIGNED",
            "ENVIADO", "SHIPPED",
            "EN_TRANSITO", "IN_TRANSIT",
            "ENTREGADO", "DELIVERED",
            "NO_ENTREGADO", "NOT_DELIVERED");

    @Test
    void laV23ConvierteLosEstadosQueYaExistianEnLaBase() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource(
                "jdbc:h2:mem:package-status-data-migration;MODE=MySQL;DB_CLOSE_DELAY=-1", "sa", "");
        Flyway.configure().dataSource(dataSource).target("22").load().migrate();

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        EXPECTED.keySet().forEach(oldStatus -> jdbc.update(
                "INSERT INTO paquetes (numero_envio, estado) VALUES (?, ?)", "ENV-" + oldStatus, oldStatus));

        Flyway.configure().dataSource(dataSource).load().migrate();

        List<Map<String, Object>> rows = jdbc.queryForList("SELECT numero_envio, estado FROM paquetes");
        assertThat(rows).hasSize(EXPECTED.size());
        rows.forEach(row -> {
            String oldStatus = row.get("numero_envio").toString().substring("ENV-".length());
            assertThat(row.get("estado")).isEqualTo(EXPECTED.get(oldStatus));
        });
    }
}
