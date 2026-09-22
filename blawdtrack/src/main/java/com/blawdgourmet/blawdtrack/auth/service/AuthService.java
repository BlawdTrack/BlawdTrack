package com.blawdgourmet.blawdtrack.auth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.blawdgourmet.blawdtrack.auth.dto.LoginRequest;
import com.blawdgourmet.blawdtrack.auth.dto.LoginResponse;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public LoginResponse authenticate(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (DisabledException ex) {
            throw new DisabledException("The account is inactive");
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        principal.getUser().setLastLoginAt(LocalDateTime.now());
        userRepository.save(principal.getUser());
        String token = jwtService.generateToken(principal);

        List<String> permissions = principal.getUser().getRole().getPermissions()
                .stream()
                .map(Permission::getCode)
                .collect(Collectors.toList());

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .id(principal.getId())
                .fullName(principal.getUser().getFullName())
                .email(principal.getUsername())
                .role(principal.getUser().getRole().getName())
                .permissions(permissions)
                .build();
    }
}