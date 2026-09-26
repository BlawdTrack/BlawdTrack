package com.blawdgourmet.blawdtrack.users.service.impl;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionEligibilityResponse;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import com.blawdgourmet.blawdtrack.users.service.AdminNotFoundException;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditService auditService;

    private AdminServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AdminServiceImpl(userRepository, roleRepository, passwordEncoder, auditService);
        ReflectionTestUtils.setField(service, "jwtExpirationMs", 3_600_000L);
    }

    @Test
    void unknownDocumentThrowsAdminNotFound() {
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, "1-2345-6789"))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.validateDeletionEligibility(DocumentType.CEDULA, "1-2345-6789"))
                .isInstanceOf(AdminNotFoundException.class)
                .hasMessage("Administrador no existente");
    }

    @Test
    void userWithDifferentRoleIsNotConsideredAdmin() {
        User mensajero = usuarioConRol(RoleName.COURIER);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, mensajero.getDocumentNumber()))
            .thenReturn(Optional.of(mensajero));

        assertThatThrownBy(() -> service.validateDeletionEligibility(DocumentType.CEDULA, mensajero.getDocumentNumber()))
                .isInstanceOf(AdminNotFoundException.class);
    }

    @Test
    void nullOrExpiredLoginIsEligibleForDeletion() {
        User withoutLogin = usuarioConRol(RoleName.SALES_ADMIN);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, withoutLogin.getDocumentNumber()))
            .thenReturn(Optional.of(withoutLogin));
        AdminDeletionEligibilityResponse withoutSession = service.validateDeletionEligibility(DocumentType.CEDULA, withoutLogin.getDocumentNumber());

        User expiredLogin = usuarioConRol(RoleName.SALES_ADMIN);
        expiredLogin.setDocumentNumber("2-3456-7890");
        expiredLogin.setLastLoginAt(LocalDateTime.now().minusHours(2));
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, expiredLogin.getDocumentNumber()))
            .thenReturn(Optional.of(expiredLogin));
        AdminDeletionEligibilityResponse expired = service.validateDeletionEligibility(DocumentType.CEDULA, expiredLogin.getDocumentNumber());

        assertThat(withoutSession.eligibleForDeletion()).isTrue();
        assertThat(withoutSession.hasActiveSession()).isFalse();
        assertThat(expired.eligibleForDeletion()).isTrue();
        assertThat(expired.hasActiveSession()).isFalse();
    }

    @Test
    void recentLoginBlocksDeletionAndExplainsWhy() {
        User administrador = usuarioConRol(RoleName.SALES_ADMIN);
        administrador.setLastLoginAt(LocalDateTime.now().minusMinutes(5));
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, administrador.getDocumentNumber()))
            .thenReturn(Optional.of(administrador));

        AdminDeletionEligibilityResponse response =
            service.validateDeletionEligibility(DocumentType.CEDULA, administrador.getDocumentNumber());

        assertThat(response.documentType()).isEqualTo(DocumentType.CEDULA);
        assertThat(response.documentNumber()).isEqualTo(administrador.getDocumentNumber());
        assertThat(response.hasActiveSession()).isTrue();
        assertThat(response.eligibleForDeletion()).isFalse();
        assertThat(response.ineligibilityReason()).isNotBlank();
    }

    @Test
    void queriesOnlyTheRequestedDocumentType() {
        User administrador = usuarioConRol(RoleName.SALES_ADMIN);
        administrador.setDocumentType(DocumentType.DIMEX);
        administrador.setDocumentNumber("12345678901");
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.DIMEX, "12345678901"))
            .thenReturn(Optional.of(administrador));

        AdminDeletionEligibilityResponse response =
            service.validateDeletionEligibility(DocumentType.DIMEX, "12345678901");

        assertThat(response.documentType()).isEqualTo(DocumentType.DIMEX);
        assertThat(response.documentNumber()).isEqualTo("12345678901");
        verify(userRepository, never()).findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, "12345678901");
        verify(userRepository, never()).findByDocumentTypeAndDocumentNumber(DocumentType.PASAPORTE, "12345678901");
    }

    private User usuarioConRol(String nombreRol) {
        return User.builder()
                .id(5L)
                .documentType(DocumentType.CEDULA)
                .documentNumber("1-2345-6789")
                .fullName("Ana Perez")
                .email("ana@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(Role.builder().name(nombreRol).build())
                .build();
    }
}
