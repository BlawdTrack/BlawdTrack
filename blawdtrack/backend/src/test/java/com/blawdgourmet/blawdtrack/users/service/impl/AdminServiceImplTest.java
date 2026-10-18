package com.blawdgourmet.blawdtrack.users.service.impl;

import java.util.List;
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
import static org.mockito.Mockito.verifyNoInteractions;
import org.mockito.ArgumentCaptor;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.common.security.TemporaryPasswordGenerator;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.service.AdminRegisteredEvent;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionEligibilityResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminUpdateRequest;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import com.blawdgourmet.blawdtrack.users.service.AdminNotFoundException;
import com.blawdgourmet.blawdtrack.users.service.AdminUniquenessValidator;
import com.blawdgourmet.blawdtrack.users.service.AdminAuditHistory;
import com.blawdgourmet.blawdtrack.users.service.UserAuditTrail;
import com.blawdgourmet.blawdtrack.users.service.UserRelatedRecordsCleaner;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserAuditTrail auditTrail;
    @Mock private UserRelatedRecordsCleaner relatedRecordsCleaner;
    @Mock private AdminAuditHistory auditHistory;
    @Mock private TemporaryPasswordGenerator temporaryPasswords;
    @Mock private ApplicationEventPublisher events;

    private static final AuthenticatedUser SUPER_USER_ACTOR = new AuthenticatedUser(
            1L, DocumentType.CEDULA, "1-1111-1111", "Alicia Admin", RoleName.SUPER_USER, "alicia@example.test");

    private AdminServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AdminServiceImpl(userRepository, roleRepository, passwordEncoder, auditTrail,
                new AdminUniquenessValidator(userRepository), auditHistory, relatedRecordsCleaner,
                temporaryPasswords, events);
        ReflectionTestUtils.setField(service, "jwtExpirationMs", 3_600_000L);
    }

    @Test
    void registeringAdminEncodesTheGeneratedPasswordAndPublishesTheWelcomeEvent() {
        when(roleRepository.findByName(RoleName.SALES_ADMIN))
                .thenReturn(Optional.of(Role.builder().name(RoleName.SALES_ADMIN).build()));
        when(temporaryPasswords.generate()).thenReturn("Temp-Pass-123!");
        when(passwordEncoder.encode("Temp-Pass-123!")).thenReturn("hashed-password");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        var request = new AdminRegistrationRequest("Ana Admin", "88888888", "Ana@Example.com",
                DocumentType.CEDULA, "123456789");

        var response = service.registrarAdministrador(request, null);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(saved.capture());
        assertThat(saved.getValue().getPasswordHash()).isEqualTo("hashed-password");
        ArgumentCaptor<AdminRegisteredEvent> event = ArgumentCaptor.forClass(AdminRegisteredEvent.class);
        verify(events).publishEvent(event.capture());
        assertThat(event.getValue().email()).isEqualTo("ana@example.com");
        assertThat(event.getValue().fullName()).isEqualTo("Ana Admin");
        assertThat(event.getValue().temporaryPassword()).isEqualTo("Temp-Pass-123!");
        assertThat(event.getValue().toString()).doesNotContain("Temp-Pass-123!");
        assertThat(response.correoElectronico()).isEqualTo("ana@example.com");
    }

    @Test
    void findingAnAdminReturnsTheProfileWithoutCredentials() {
        User admin = usuarioConRol(RoleName.SALES_ADMIN);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber()))
            .thenReturn(Optional.of(admin));

        var detail = service.findAdministrator(DocumentType.CEDULA, admin.getDocumentNumber());

        assertThat(detail.documentType()).isEqualTo(DocumentType.CEDULA);
        assertThat(detail.documentNumber()).isEqualTo(admin.getDocumentNumber());
        assertThat(detail.fullName()).isEqualTo(admin.getFullName());
        assertThat(detail.email()).isEqualTo(admin.getEmail());
        assertThat(detail.status()).isEqualTo(admin.getStatus());
        assertThat(detail.toString()).doesNotContain(admin.getPasswordHash());
    }

    @Test
    void findingAnUnknownDocumentThrowsAdminNotFound() {
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, "1-2345-6789"))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findAdministrator(DocumentType.CEDULA, "1-2345-6789"))
                .isInstanceOf(AdminNotFoundException.class)
                .hasMessage("Administrador no existente");
    }

    @Test
    void findingAUserWithAnotherRoleIsNotFoundEither() {
        User mensajero = usuarioConRol(RoleName.COURIER);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, mensajero.getDocumentNumber()))
            .thenReturn(Optional.of(mensajero));

        assertThatThrownBy(() -> service.findAdministrator(DocumentType.CEDULA, mensajero.getDocumentNumber()))
                .isInstanceOf(AdminNotFoundException.class);
    }

    @Test
    void updatingOnlyTheNameAuditsItAndKeepsTheSessionOpen() {
        User admin = usuarioConRol(RoleName.SALES_ADMIN);
        int versionBefore = admin.getTokenVersion();
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber()))
            .thenReturn(Optional.of(admin));

        var detail = service.updateAdministrator(DocumentType.CEDULA, admin.getDocumentNumber(),
                new AdminUpdateRequest("Ana Nueva", null, null, null), SUPER_USER_ACTOR);

        assertThat(detail.fullName()).isEqualTo("Ana Nueva");
        assertThat(admin.getTokenVersion()).isEqualTo(versionBefore);
        verify(auditTrail).adminUpdated(eq(SUPER_USER_ACTOR), eq(admin),
                argThat(text -> text.contains("Alicia Admin") && text.contains("modificó los datos (nombre)")
                        && text.contains("Ana Nueva")));
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void changingStatusAndPasswordRaisesTheTokenVersionAndNeverAuditsThePassword() {
        User admin = usuarioConRol(RoleName.SALES_ADMIN);
        int versionBefore = admin.getTokenVersion();
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber()))
            .thenReturn(Optional.of(admin));
        when(passwordEncoder.encode("NuevaClave123")).thenReturn("nuevo-hash");

        service.updateAdministrator(DocumentType.CEDULA, admin.getDocumentNumber(),
                new AdminUpdateRequest(null, null, "NuevaClave123", UserStatus.INACTIVE), SUPER_USER_ACTOR);

        assertThat(admin.getStatus()).isEqualTo(UserStatus.INACTIVE);
        assertThat(admin.getPasswordHash()).isEqualTo("nuevo-hash");
        assertThat(admin.getTokenVersion()).isGreaterThan(versionBefore);
        verify(auditTrail).adminDeactivated(eq(SUPER_USER_ACTOR), eq(admin),
                argThat(text -> text.contains("desactivó") && text.contains("sesión activa se cerró")));
        verify(auditTrail).adminPasswordChanged(eq(SUPER_USER_ACTOR), eq(admin),
                argThat(text -> text.contains("cambió la contraseña") && !text.contains("NuevaClave123")));
    }

    @Test
    void anUnchangedRequestLeavesNoTrace() {
        User admin = usuarioConRol(RoleName.SALES_ADMIN);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber()))
            .thenReturn(Optional.of(admin));

        service.updateAdministrator(DocumentType.CEDULA, admin.getDocumentNumber(),
                new AdminUpdateRequest(admin.getFullName(), admin.getEmail(), null, admin.getStatus()), SUPER_USER_ACTOR);

        verifyNoInteractions(auditTrail);
    }

    @Test
    void updatingAnUnknownAdminThrowsAdminNotFound() {
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, "1-2345-6789"))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateAdministrator(DocumentType.CEDULA, "1-2345-6789",
                new AdminUpdateRequest("X", null, null, null), SUPER_USER_ACTOR))
                .isInstanceOf(AdminNotFoundException.class);
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
    void recentLoginDoesNotBlockDeletionButWarns() {
        User administrador = usuarioConRol(RoleName.SALES_ADMIN);
        administrador.setLastLoginAt(LocalDateTime.now().minusMinutes(5));
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, administrador.getDocumentNumber()))
            .thenReturn(Optional.of(administrador));

        AdminDeletionEligibilityResponse response =
            service.validateDeletionEligibility(DocumentType.CEDULA, administrador.getDocumentNumber());

        assertThat(response.documentType()).isEqualTo(DocumentType.CEDULA);
        assertThat(response.documentNumber()).isEqualTo(administrador.getDocumentNumber());
        assertThat(response.hasActiveSession()).isTrue();
        assertThat(response.eligibleForDeletion()).isTrue();
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

    @Test
    void getAuditLogDelegatesToTheAdminHistoryPort() {
        List<AdminAuditLogResponse> history = List.of(
                new AdminAuditLogResponse(1L, "CREAR_ADMINISTRADOR", "Ana Perez", "detalle", LocalDateTime.now()));
        when(auditHistory.adminHistory()).thenReturn(history);

        assertThat(service.getAuditLog()).isSameAs(history);
    }

    @Test
    void getAdministratorHistoryAsksThePortForThatAdminOnly() {
        User admin = usuarioConRol(RoleName.SALES_ADMIN);
        List<AdminAuditLogResponse> history = List.of(
                new AdminAuditLogResponse(2L, "ACTUALIZAR_ADMINISTRADOR", "Ana Perez", "detalle", LocalDateTime.now()));
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber()))
            .thenReturn(Optional.of(admin));
        when(auditHistory.adminHistory(admin.getId())).thenReturn(history);

        assertThat(service.getAdministratorHistory(DocumentType.CEDULA, admin.getDocumentNumber())).isSameAs(history);
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
