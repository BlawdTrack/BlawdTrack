package com.blawdgourmet.blawdtrack.packages.indexing;

import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.ArrayDeque;
import java.util.Queue;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.spy;

class JdbcMetadataSchemaInspectorTest {

    @Test
    void detectaColumnasEIndicesEnDiferentesCasos() throws Exception {
        try (Connection connection = DriverManager.getConnection("jdbc:h2:mem:metadata-index-inspector;MODE=MySQL;DB_CLOSE_DELAY=-1");
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE paquetes (id BIGINT AUTO_INCREMENT PRIMARY KEY, numero_orden VARCHAR(50), nombre_cliente VARCHAR(120), telefono VARCHAR(30))");
            statement.execute("CREATE UNIQUE INDEX uq_paquetes_numero_orden ON paquetes (numero_orden)");
            statement.execute("CREATE INDEX idx_paquetes_nombre_cliente ON paquetes (nombre_cliente)");

            SchemaInspector inspector = new JdbcMetadataSchemaInspector(connection);

            assertThat(inspector.columnExists("paquetes", "NUMERO_ORDEN")).isTrue();
            assertThat(inspector.columnExists("paquetes", "numero_inexistente")).isFalse();
            assertThat(inspector.hasIndexStartingWith("paquetes", "numero_orden")).isTrue();
            assertThat(inspector.hasIndexStartingWith("paquetes", "nombre_cliente")).isTrue();
            assertThat(inspector.hasIndexStartingWith("paquetes", "telefono")).isFalse();
        }
    }

    @Test
    void reconoceIndicesConOtroNombreSobreLaMismaColumna() throws Exception {
        try (Connection connection = DriverManager.getConnection("jdbc:h2:mem:metadata-index-inspector-2;MODE=MySQL;DB_CLOSE_DELAY=-1");
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE paquetes (id BIGINT AUTO_INCREMENT PRIMARY KEY, numero_orden VARCHAR(50))");
            statement.execute("CREATE INDEX idx_paquetes_orden_alterno ON paquetes (numero_orden)");

            SchemaInspector inspector = new JdbcMetadataSchemaInspector(connection);
            assertThat(inspector.hasIndexStartingWith("paquetes", "numero_orden")).isTrue();
        }
    }

    @Test
    void cierraLasConexionesObtenidasDelProveedorEnAmbasConsultas() throws Exception {
        try (Connection setupConnection = DriverManager.getConnection("jdbc:h2:mem:metadata-index-inspector-owned;MODE=MySQL;DB_CLOSE_DELAY=-1");
             Statement statement = setupConnection.createStatement()) {
            statement.execute("CREATE TABLE paquetes (id BIGINT AUTO_INCREMENT PRIMARY KEY, numero_orden VARCHAR(50))");
            statement.execute("CREATE INDEX idx_paquetes_numero_orden ON paquetes (numero_orden)");
        }

        Queue<Connection> connections = new ArrayDeque<>();
        Connection columnConnection = spy(DriverManager.getConnection("jdbc:h2:mem:metadata-index-inspector-owned;MODE=MySQL;DB_CLOSE_DELAY=-1"));
        Connection indexConnection = spy(DriverManager.getConnection("jdbc:h2:mem:metadata-index-inspector-owned;MODE=MySQL;DB_CLOSE_DELAY=-1"));
        connections.add(columnConnection);
        connections.add(indexConnection);
        SchemaInspector inspector = new JdbcMetadataSchemaInspector(connections::remove);

        assertThat(inspector.columnExists("paquetes", "numero_orden")).isTrue();
        assertThat(inspector.hasIndexStartingWith("paquetes", "numero_orden")).isTrue();
        assertThat(columnConnection.isClosed()).isTrue();
        assertThat(indexConnection.isClosed()).isTrue();
    }
}
