package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;

/**
 * V15 agrega la columna "estado" a "paquetes". Se ejecuta Flyway con validación de JPA para
 * comprobar que la migración y la entidad coinciden.
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:package-status-migration-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.flyway.enabled=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
@Transactional
class PackageStatusMigrationTest {

    @Autowired private JdbcTemplate jdbc;
    @Autowired private DeliveryPackageRepository packages;

    @Test
    void laMigracionV15SeAplicaSinErrores() {
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM \"flyway_schema_history\" WHERE \"version\" = '15' AND \"success\" = TRUE",
                Integer.class)).isEqualTo(1);
    }

    @Test
    void unPaqueteNuevoQuedaPendientePorDefecto() {
        DeliveryPackage saved = packages.saveAndFlush(
                DeliveryPackage.builder().shipmentNumber("env-estado-1").build());

        assertThat(packages.findById(saved.getId()).orElseThrow().getStatus())
                .isEqualTo(PackageStatus.PENDING);
    }

    @Test
    void elEstadoSePersisteComoElNombreDeLaConstante() {
        packages.saveAndFlush(DeliveryPackage.builder()
                .shipmentNumber("env-estado-2")
                .status(PackageStatus.SHIPPED)
                .build());

        assertThat(jdbc.queryForObject(
                "SELECT estado FROM paquetes WHERE numero_envio = 'ENV-ESTADO-2'", String.class))
                .isEqualTo("SHIPPED");
    }

    @Test
    void laBaseDeDatosRechazaUnEstadoInvalido() {
        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO paquetes (numero_envio, estado) VALUES ('ENV-ESTADO-3', 'CANCELADO')"))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }
}
