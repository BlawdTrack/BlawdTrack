package com.blawdgourmet.blawdtrack.auth.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
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