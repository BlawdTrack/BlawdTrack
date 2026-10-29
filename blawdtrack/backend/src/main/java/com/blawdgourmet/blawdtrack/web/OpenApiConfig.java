package com.blawdgourmet.blawdtrack.web;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Descripción de la API para Swagger UI ({@code /swagger-ui.html}) y {@code /v3/api-docs}. Declara el esquema
 * Bearer JWT: el botón "Authorize" recibe el token que devuelve {@code POST /api/v1/auth/login} y lo envía en
 * el encabezado {@code Authorization} de cada prueba.
 */
@Configuration
public class OpenApiConfig {

    static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI blawdTrackOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("BlawdTrack API")
                        .version("1.0.0")
                        .description("API de BlawdTrack, el sistema de seguimiento de paquetes y mensajeros de Blawd Gourmet. "
                                + "Inicia sesión en POST /api/v1/auth/login, copia el token y pégalo en «Authorize»."))
                .components(new Components().addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME));
    }
}
