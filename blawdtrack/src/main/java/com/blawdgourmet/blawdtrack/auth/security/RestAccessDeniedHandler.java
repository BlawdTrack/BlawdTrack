package com.blawdgourmet.blawdtrack.auth.security;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.common.dto.ApiError;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
* Responds with the unified error format (P05) when an authenticated user
* does not have the required role (403) — this is the case for the
* "Super User only" restriction on admin registration.
 */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                        AccessDeniedException accessDeniedException) throws IOException {

        ApiError error = ApiError.builder()
                .code("ACCESO_DENEGADO")
                .message("You do not have the required permissions (Super User role) to perform this action.")
                .status(HttpStatus.FORBIDDEN.value())
                .build();

        response.setStatus(HttpStatus.FORBIDDEN.value());
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
