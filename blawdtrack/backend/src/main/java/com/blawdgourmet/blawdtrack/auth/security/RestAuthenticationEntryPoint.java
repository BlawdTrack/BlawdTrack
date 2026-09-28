package com.blawdgourmet.blawdtrack.auth.security;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.common.dto.ApiError;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
* Responds with the unified error format (P05) when the request does not include
* valid credentials (401).
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException {

        ApiError error = ApiError.builder()
                .code("NO_AUTENTICADO")
                .message("Authentication is required to access this resource.")
                .status(HttpStatus.UNAUTHORIZED.value())
                .build();

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(toJson(error));
    }

    private String toJson(ApiError error) {
        return "{\"code\":\"" + escape(error.getCode()) + "\"," +
                "\"message\":\"" + escape(error.getMessage()) + "\"," +
                "\"status\":" + error.getStatus() + "}";
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
