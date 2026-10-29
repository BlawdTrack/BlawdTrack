package com.blawdgourmet.blawdtrack.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/** Con Swagger activado (SWAGGER_ENABLED=true), Swagger y /v3/api-docs responden sin iniciar sesión y declaran el esquema Bearer JWT del botón "Authorize". */
@SpringBootTest(properties = {"springdoc.api-docs.enabled=true", "springdoc.swagger-ui.enabled=true"})
@AutoConfigureMockMvc
class OpenApiDocumentationTest {

    @Autowired private MockMvc mvc;

    @Test
    void apiDocsEsPublicoYDeclaraElEsquemaBearerJwt() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("BlawdTrack API"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"))
                .andExpect(jsonPath("$.paths['/api/v1/auth/login']").exists());
    }

    @Test
    void swaggerUiSePuedeAbrirSinToken() throws Exception {
        mvc.perform(get("/swagger-ui.html")).andExpect(status().is3xxRedirection());
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
    }
}
