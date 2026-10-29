package com.blawdgourmet.blawdtrack.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Sin SWAGGER_ENABLED, Swagger y /v3/api-docs no existen: responden 404. Las propiedades repiten la configuración de
 * application.properties (que en las pruebas la sustituye el archivo de src/test/resources).
 */
@SpringBootTest(properties = {"springdoc.api-docs.enabled=${SWAGGER_ENABLED:false}",
        "springdoc.swagger-ui.enabled=${SWAGGER_ENABLED:false}"})
@AutoConfigureMockMvc
class OpenApiHiddenByDefaultTest {

    @Autowired private MockMvc mvc;

    @Test
    void swaggerYApiDocsEstanOcultosPorDefecto() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isNotFound());
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isNotFound());
    }
}
