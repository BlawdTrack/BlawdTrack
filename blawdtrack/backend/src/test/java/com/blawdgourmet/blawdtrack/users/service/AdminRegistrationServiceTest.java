package com.blawdgourmet.blawdtrack.users.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.common.security.TemporaryPasswordGenerator;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminRegistrationServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserAuditTrail auditTrail;
    @Mock private TemporaryPasswordGenerator temporaryPasswords;
    @Mock private ApplicationEventPublisher events;

    private AdminRegistrationService service;

    @BeforeEach
    void setUp() {
        service = new AdminRegistrationService(userRepository, roleRepository, passwordEncoder, auditTrail,
                new AdminUniquenessValidator(userRepository), temporaryPasswords, events);
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
}
