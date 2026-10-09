package com.blawdgourmet.blawdtrack.packages.indexing;

import org.flywaydb.core.api.migration.Context;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PackageSearchIndexMigrationTest {

    @Test
    void creaTodosLosIndicesCuandoLaTablaTieneLasColumnasEsperadas() throws Exception {
        try (Connection connection = DriverManager.getConnection("jdbc:h2:mem:index-migration-all;MODE=MySQL;DB_CLOSE_DELAY=-1");
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE paquetes (id BIGINT AUTO_INCREMENT PRIMARY KEY, numero_envio VARCHAR(50) NOT NULL, numero_orden VARCHAR(50), nombre_cliente VARCHAR(120), direccion_entrega VARCHAR(500), telefono VARCHAR(30), horario_preferencia VARCHAR(255), CONSTRAINT uq_paquetes_numero_envio UNIQUE (numero_envio))");

            PackageSearchIndexMigration migration = new PackageSearchIndexMigration(new SearchIndexCreator(new PackageSearchIndexCatalog(), new JdbcMetadataSchemaInspector(connection)));
            Context context = mock(Context.class);
            when(context.getConnection()).thenReturn(connection);

            migration.migrate(context);

            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_NUMERO_ORDEN")).isEqualTo(1);
            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_NOMBRE_CLIENTE")).isEqualTo(1);
            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_DIRECCION_ENTREGA")).isEqualTo(1);
            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_TELEFONO")).isEqualTo(1);
            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_HORARIO_PREFERENCIA")).isEqualTo(1);
        }
    }

    @Test
    void noCreaIndicesCuandoLaRamaSoloTieneIdYNumeroEnvio() throws Exception {
        try (Connection connection = DriverManager.getConnection("jdbc:h2:mem:index-migration-legacy;MODE=MySQL;DB_CLOSE_DELAY=-1");
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE paquetes (id BIGINT AUTO_INCREMENT PRIMARY KEY, numero_envio VARCHAR(50) NOT NULL, CONSTRAINT uq_paquetes_numero_envio UNIQUE (numero_envio))");

            PackageSearchIndexMigration migration = new PackageSearchIndexMigration(new SearchIndexCreator(new PackageSearchIndexCatalog(), new JdbcMetadataSchemaInspector(connection)));
            Context context = mock(Context.class);
            when(context.getConnection()).thenReturn(connection);

            migration.migrate(context);

            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_NUMERO_ORDEN")).isZero();
            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_NOMBRE_CLIENTE")).isZero();
            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_TELEFONO")).isZero();
        }
    }

    @Test
    void creaSoloLasColumnasQueExistenYNoDuplicaIndices() throws Exception {
        try (Connection connection = DriverManager.getConnection("jdbc:h2:mem:index-migration-partial;MODE=MySQL;DB_CLOSE_DELAY=-1");
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE paquetes (id BIGINT AUTO_INCREMENT PRIMARY KEY, numero_envio VARCHAR(50) NOT NULL, numero_orden VARCHAR(50), nombre_cliente VARCHAR(120), CONSTRAINT uq_paquetes_numero_envio UNIQUE (numero_envio))");

            PackageSearchIndexMigration migration = new PackageSearchIndexMigration(new SearchIndexCreator(new PackageSearchIndexCatalog(), new JdbcMetadataSchemaInspector(connection)));
            Context context = mock(Context.class);
            when(context.getConnection()).thenReturn(connection);

            migration.migrate(context);
            migration.migrate(context);

            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_NUMERO_ORDEN")).isEqualTo(1);
            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_NOMBRE_CLIENTE")).isEqualTo(1);
            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_DIRECCION_ENTREGA")).isZero();

            statement.execute("CREATE INDEX idx_paquetes_numero_orden_alterno ON paquetes (numero_orden)");
            migration.migrate(context);
            assertThat(countIndices(connection, "PAQUETES", "IDX_PAQUETES_NUMERO_ORDEN")).isEqualTo(1);
        }
    }

    @Test
    void exponeMetadatosCorrectosDeLaMigracion() {
        PackageSearchIndexMigration migration = new PackageSearchIndexMigration(new SearchIndexCreator(new PackageSearchIndexCatalog(), new JdbcMetadataSchemaInspector((Connection) null)));

        assertThat(migration.getVersion()).isNull();
        assertThat(migration.canExecuteInTransaction()).isFalse();
    }

    private int countIndices(Connection connection, String tableName, String indexName) throws Exception {
        String sql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.INDEXES WHERE TABLE_NAME = ? AND INDEX_NAME = ?";
        try (var preparedStatement = connection.prepareStatement(sql)) {
            preparedStatement.setString(1, tableName);
            preparedStatement.setString(2, indexName);
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                resultSet.next();
                return resultSet.getInt(1);
            }
        }
    }
}
