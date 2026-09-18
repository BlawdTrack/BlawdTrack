package com.blawdgourmet.blawdtrack.users.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.blawdgourmet.blawdtrack.users.dto.PasswordResetRequest;
import com.blawdgourmet.blawdtrack.users.dto.PasswordResetTokenResponse;
import com.blawdgourmet.blawdtrack.users.dto.PasswordUpdateRequest;
import com.blawdgourmet.blawdtrack.users.service.PasswordResetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth/password-reset")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/request")
    public PasswordResetTokenResponse requestToken(@Valid @RequestBody PasswordResetRequest request) {
        return passwordResetService.createToken(request.email());
    }

    @PostMapping("/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmPasswordUpdate(@Valid @RequestBody PasswordUpdateRequest request) {
        passwordResetService.updatePassword(request.token(), request.newPassword());
    }
}