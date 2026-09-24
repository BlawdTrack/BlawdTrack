package com.blawdgourmet.blawdtrack.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.blawdgourmet.blawdtrack.auth.dto.LoginRequest;
import com.blawdgourmet.blawdtrack.auth.dto.LoginResponse;
import com.blawdgourmet.blawdtrack.auth.security.JwtService;
import com.blawdgourmet.blawdtrack.auth.security.UserPrincipal;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private UserRepository userRepository;

    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(authenticationManager, jwtService, userRepository);
    }

    @Test
    void authenticate_setsLastLoginAtWithoutSavingTheWholeUser() {
        User user = User.builder()
                .id(7L)
                .documentType(DocumentType.CEDULA)
                .documentNumber("123456789")
                .fullName("Ana Pérez")
                .email("ana@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(Role.builder()
                        .name(RoleName.SALES_ADMIN)
                        .permissions(Set.of(Permission.builder().code("ADMIN_READ").build()))
                        .build())
                .build();

        UserPrincipal principal = new UserPrincipal(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal,
                "secret",
                principal.getAuthorities()
        );

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtService.generateToken(principal)).thenReturn("jwt-token");
        when(userRepository.updateLastLoginAt(eq(user.getId()), any(LocalDateTime.class))).thenReturn(1);

        LoginResponse response = service.authenticate(new LoginRequest("ana@example.test", "secret"));

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getFullName()).isEqualTo("Ana Pérez");
        assertThat(response.getPermissions()).containsExactly("ADMIN_READ");
        assertThat(user.getLastLoginAt()).isNotNull();
        verify(userRepository).updateLastLoginAt(eq(user.getId()), any(LocalDateTime.class));
    }
}
