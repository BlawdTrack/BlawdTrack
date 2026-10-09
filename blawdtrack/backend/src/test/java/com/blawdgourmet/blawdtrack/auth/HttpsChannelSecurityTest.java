package com.blawdgourmet.blawdtrack.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HU-001: cuando Tomcat termina TLS él mismo (server.ssl.enabled=true), toda
 * petición sobre HTTP plano debe rechazarse/redirigirse. Por defecto esta
 * propiedad está en false (ver SecurityConfig.sslEnabled) para no romper el
 * desarrollo local ni un despliegue donde el TLS lo termina un proxy.
 */
@SpringBootTest(properties = "server.ssl.enabled=true")
@AutoConfigureMockMvc
class HttpsChannelSecurityTest {

    @Autowired private MockMvc mvc;

    @Test
    void unaPeticionPorHttpPlanoNoLlegaAlEndpointCuandoSslEstaHabilitado() throws Exception {
        mvc.perform(post("/api/v1/auth/login")
                        .secure(false)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"someone@example.com\",\"password\":\"whatever123\"}"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void unaPeticionPorHttpsSiLlegaAlEndpoint() throws Exception {
        mvc.perform(post("/api/v1/auth/login")
                        .secure(true)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"someone@example.com\",\"password\":\"whatever123\"}"))
                .andExpect(status().isUnauthorized());
    }
}
