package com.blawdgourmet.blawdtrack.couriers;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CourierMigrationTest {

    @Test
    void actualizarDesdeV1ConservaUsuariosYNormalizaEstadoActivo() throws Exception {
        String url = "jdbc:h2:mem:courier-upgrade-" + UUID.randomUUID() + ";MODE=MySQL";
        // La conexión mantiene viva esta base aislada durante ambas migraciones.
        try (var connection = DriverManager.getConnection(url, "sa", "");
             var statement = connection.createStatement()) {
            Flyway.configure().dataSource(url, "sa", "").target("1").load().migrate();
            statement.executeUpdate("INSERT INTO roles (id, nombre) VALUES (1, 'MENSAJERO')");
            statement.executeUpdate("""
                    INSERT INTO usuarios (cedula, nombre_completo, correo, contrasena_hash, telefono, estado, rol_id)
                    VALUES ('111', 'Usuario previo activo', 'activo@example.test', 'hash-previo', '88888888', 'ACTIVO', 1),
                           ('222', 'Usuario previo inactivo', 'inactivo@example.test', 'hash-inactivo', '   ', 'INACTIVE', 1)
                    """);

            Flyway flyway = Flyway.configure().dataSource(url, "sa", "").target("3").load();
            assertThat(flyway.migrate().migrationsExecuted).isEqualTo(2);
            flyway.validate();

            try (var rows = statement.executeQuery(
                    "SELECT cedula, nombre_completo, correo, contrasena_hash, telefono, estado, rol_id FROM usuarios ORDER BY cedula")) {
                assertThat(rows.next()).isTrue();
                assertThat(rows.getString("cedula")).isEqualTo("111");
                assertThat(rows.getString("nombre_completo")).isEqualTo("Usuario previo activo");
                assertThat(rows.getString("correo")).isEqualTo("activo@example.test");
                assertThat(rows.getString("telefono")).isEqualTo("88888888");
                assertThat(rows.getString("contrasena_hash")).isEqualTo("hash-previo");
                assertThat(rows.getString("estado")).isEqualTo("ACTIVE");
                assertThat(rows.getLong("rol_id")).isEqualTo(1L);
                assertThat(rows.next()).isTrue();
                assertThat(rows.getString("telefono")).isNull();
                assertThat(rows.getString("estado")).isEqualTo("INACTIVE");
                assertThat(rows.next()).isFalse();
            }

            assertThatThrownBy(() -> statement.executeUpdate("""
                    INSERT INTO usuarios (cedula, nombre_completo, correo, contrasena_hash, telefono, rol_id)
                    VALUES ('333', 'Otro usuario', 'otro@example.test', 'hash', '88888888', 1)
                    """)).isInstanceOf(SQLException.class);

            statement.executeUpdate("""
                    INSERT INTO mensajeros (usuario_id, horario, capacidad_maxima_carga_kg)
                    SELECT id, 'Lunes a viernes, 08:00-17:00', 25.50 FROM usuarios WHERE cedula = '111'
                    """);
            assertThat(flyway.migrate().migrationsExecuted).isZero();
            try (var rows = statement.executeQuery("SELECT COUNT(*) FROM mensajeros")) {
                assertThat(rows.next()).isTrue();
                assertThat(rows.getInt(1)).isEqualTo(1);
            }
        }
    }
}
