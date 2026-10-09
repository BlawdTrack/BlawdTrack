package com.blawdgourmet.blawdtrack.packages.indexing;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:package-index-flyway;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.flyway.enabled=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
class PackageSearchIndexFlywayIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void registraLaMigracionRepetibleEnFlywaySchemaHistory() {
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM \"flyway_schema_history\" WHERE \"version\" IS NULL AND \"success\" = TRUE",
                Integer.class)).isPositive();
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM \"flyway_schema_history\" WHERE \"description\" = 'crear indices busqueda paquetes'",
                Integer.class)).isPositive();
    }
}
