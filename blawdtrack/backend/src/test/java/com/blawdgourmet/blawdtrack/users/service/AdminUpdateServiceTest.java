package com.blawdgourmet.blawdtrack.users.service;

import static com.blawdgourmet.blawdtrack.users.service.AdminTestData.SUPER_USER_ACTOR;
import static com.blawdgourmet.blawdtrack.users.service.AdminTestData.userWithRole;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminUpdateRequest;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminUpdateServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserAuditTrail auditTrail;

    private AdminUpdateService service;

    @BeforeEach
    void setUp() {
        service = new AdminUpdateService(userRepository, passwordEncoder,
                new AdminUniquenessValidator(userRepository), new AdminLookup(userRepository),
                new AdminUpdateAuditor(auditTrail));
    }

    @Test
    void updatingOnlyTheNameAuditsItAndKeepsTheSessionOpen() {
        User admin = userWithRole(RoleName.SALES_ADMIN);
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
        User admin = userWithRole(RoleName.SALES_ADMIN);
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
    void reactivatingAnAdminAuditsTheActivation() {
        User admin = userWithRole(RoleName.SALES_ADMIN);
        admin.changeStatus(UserStatus.INACTIVE);
        when(userRepository.findByDocumentTypeAndDocumentNumber(DocumentType.CEDULA, admin.getDocumentNumber()))
            .thenReturn(Optional.of(admin));

        service.updateAdministrator(DocumentType.CEDULA, admin.getDocumentNumber(),
                new AdminUpdateRequest(null, null, null, UserStatus.ACTIVE), SUPER_USER_ACTOR);

        verify(auditTrail).adminActivated(eq(SUPER_USER_ACTOR), eq(admin),
                argThat(text -> text.contains("activó al") && text.contains("sesión activa se cerró")));
    }

    @Test
    void anUnchangedRequestLeavesNoTrace() {
        User admin = userWithRole(RoleName.SALES_ADMIN);
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
}
