package com.blawdgourmet.blawdtrack.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Respuesta de un inicio de sesión exitoso.
 * <ul>
 *   <li>{@code token}: JWT firmado que el frontend envía como {@code Authorization: Bearer}.</li>
 *   <li>{@code type}: siempre {@code Bearer}.</li>
 *   <li>{@code role}: nombre del rol (por ejemplo {@code SUPER_USUARIO}).</li>
 *   <li>{@code permissions}: códigos de los permisos del rol.</li>
 * </ul>
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String type;
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private List<String> permissions;
}