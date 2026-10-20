package com.blawdgourmet.blawdtrack.users.service;

import static com.blawdgourmet.blawdtrack.users.service.AdminTestData.JWT_EXPIRATION_MS;
import static com.blawdgourmet.blawdtrack.users.service.AdminTestData.SUPER_USER_ACTOR;
import static com.blawdgourmet.blawdtrack.users.service.AdminTestData.userWithRole;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionEligibilityResponse;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminDeletionServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserAuditTrail auditTrail;
    @Mock private UserRelatedRecordsCleaner relatedRecordsCleaner;

    private AdminDeletionService service;

    @BeforeEach
    void setUp() {
        service = new AdminDeletionService(userRepository, auditTrail, relatedRecordsCleaner,
                new AdminLookup(userRepository), new AdminSessionPolicy(JWT_EXPIRATION_MS));
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
        User mensajero = userWithRole(RoleName.COURIER);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, mensajero.getDocumentNumber()))
            .thenReturn(Optional.of(mensajero));

        assertThatThrownBy(() -> service.validateDeletionEligibility(DocumentType.CEDULA, mensajero.getDocumentNumber()))
                .isInstanceOf(AdminNotFoundException.class);
    }

    @Test
    void nullOrExpiredLoginIsEligibleForDeletion() {
        User withoutLogin = userWithRole(RoleName.SALES_ADMIN);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, withoutLogin.getDocumentNumber()))
            .thenReturn(Optional.of(withoutLogin));
        AdminDeletionEligibilityResponse withoutSession = service.validateDeletionEligibility(DocumentType.CEDULA, withoutLogin.getDocumentNumber());

        User expiredLogin = userWithRole(RoleName.SALES_ADMIN);
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
        User administrador = userWithRole(RoleName.SALES_ADMIN);
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
        User administrador = userWithRole(RoleName.SALES_ADMIN);
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
    void deletingAnAdminAuditsItCleansItsRecordsAndRemovesIt() {
        User admin = userWithRole(RoleName.SALES_ADMIN);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber()))
            .thenReturn(Optional.of(admin));

        var response = service.deleteAdministrator(DocumentType.CEDULA, admin.getDocumentNumber(), SUPER_USER_ACTOR);

        assertThat(response.message()).isEqualTo("Administrador eliminado correctamente.");
        verify(auditTrail).adminDeleted(SUPER_USER_ACTOR, admin);
        verify(relatedRecordsCleaner).removeFor(admin.getId());
        verify(userRepository).delete(admin);
    }

    @Test
    void deletingAUserThatIsNotAnAdminIsDeniedAndTouchesNothing() {
        User mensajero = userWithRole(RoleName.COURIER);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, mensajero.getDocumentNumber()))
            .thenReturn(Optional.of(mensajero));

        assertThatThrownBy(() -> service.deleteAdministrator(
                DocumentType.CEDULA, mensajero.getDocumentNumber(), SUPER_USER_ACTOR))
                .isInstanceOf(AccessDeniedException.class);
        verify(userRepository, never()).delete(mensajero);
    }

    @Test
    void deletingAnUnknownAdminThrowsAdminNotFound() {
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, "1-2345-6789"))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteAdministrator(DocumentType.CEDULA, "1-2345-6789", SUPER_USER_ACTOR))
                .isInstanceOf(AdminNotFoundException.class)
                .hasMessage("Administrador no existente");
    }
}
