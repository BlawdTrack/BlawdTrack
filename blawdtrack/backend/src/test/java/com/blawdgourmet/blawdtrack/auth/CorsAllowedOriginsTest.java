package com.blawdgourmet.blawdtrack.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Despliegue: con {@code app.cors.allowed-origins} definido, solo el frontend publicado puede llamar a la API desde el
 * navegador. Sin la propiedad (desarrollo) se aceptan todos los orígenes.
 */
@SpringBootTest(properties = "app.cors.allowed-origins=https://app.blawdtrack.example,https://otro.blawdtrack.example")
@AutoConfigureMockMvc
class CorsAllowedOriginsTest {

    @Autowired private MockMvc mvc;

    private org.springframework.test.web.servlet.ResultActions preflightFrom(String origin) throws Exception {
        return mvc.perform(options("/api/v1/auth/login")
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "POST"));
    }

    @Test
    void aceptaElOrigenDelFrontendPublicado() throws Exception {
        preflightFrom("https://app.blawdtrack.example")
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://app.blawdtrack.example"));
    }

    @Test
    void aceptaCualquieraDeLosOrigenesDeLaLista() throws Exception {
        preflightFrom("https://otro.blawdtrack.example")
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://otro.blawdtrack.example"));
    }

    @Test
    void rechazaUnOrigenQueNoEstaEnLaLista() throws Exception {
        preflightFrom("https://malicioso.example")
                .andExpect(status().isForbidden());
    }
}
