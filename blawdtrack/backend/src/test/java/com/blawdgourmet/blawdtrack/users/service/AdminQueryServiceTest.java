package com.blawdgourmet.blawdtrack.users.service;

import static com.blawdgourmet.blawdtrack.users.service.AdminTestData.JWT_EXPIRATION_MS;
import static com.blawdgourmet.blawdtrack.users.service.AdminTestData.userWithRole;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminQueryServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private AdminAuditHistory auditHistory;

    private AdminQueryService service;

    @BeforeEach
    void setUp() {
        service = new AdminQueryService(userRepository, auditHistory, new AdminLookup(userRepository),
                new AdminSessionPolicy(JWT_EXPIRATION_MS));
    }

    @Test
    void listingMarksOnlyAdminsWithARecentLoginAsHavingAnActiveSession() {
        User connected = userWithRole(RoleName.SALES_ADMIN);
        connected.setLastLoginAt(LocalDateTime.now().minusMinutes(5));
        User idle = userWithRole(RoleName.SALES_ADMIN);
        idle.setDocumentNumber("2-3456-7890");
        when(userRepository.findByRole_NameOrderByFullNameAsc(RoleName.SALES_ADMIN))
                .thenReturn(List.of(connected, idle));

        var summaries = service.list();

        assertThat(summaries).hasSize(2);
        assertThat(summaries.get(0).hasActiveSession()).isTrue();
        assertThat(summaries.get(1).hasActiveSession()).isFalse();
    }

    @Test
    void findingAnAdminReturnsTheProfileWithoutCredentials() {
        User admin = userWithRole(RoleName.SALES_ADMIN);
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
        User mensajero = userWithRole(RoleName.COURIER);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, mensajero.getDocumentNumber()))
            .thenReturn(Optional.of(mensajero));

        assertThatThrownBy(() -> service.findAdministrator(DocumentType.CEDULA, mensajero.getDocumentNumber()))
                .isInstanceOf(AdminNotFoundException.class);
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
        User admin = userWithRole(RoleName.SALES_ADMIN);
        List<AdminAuditLogResponse> history = List.of(
                new AdminAuditLogResponse(2L, "ACTUALIZAR_ADMINISTRADOR", "Ana Perez", "detalle", LocalDateTime.now()));
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber()))
            .thenReturn(Optional.of(admin));
        when(auditHistory.adminHistory(admin.getId())).thenReturn(history);

        assertThat(service.getAdministratorHistory(DocumentType.CEDULA, admin.getDocumentNumber())).isSameAs(history);
    }
}
