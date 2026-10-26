package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PackageDeletionAuditServiceImplTest {

    private static final AuthenticatedUser ACTOR = new AuthenticatedUser(
            7L, DocumentType.CEDULA, "1-1111-1111", "Ana Ventas", "ADMIN_VENTAS", "ana@example.test");

    @Mock private AuditLogRepository auditLogRepository;
    @Mock private UserRepository userRepository;

    @Test
    void guardaElRegistroConActorAccionDetalleYFechaDelServidor() {
        User actorReference = User.builder().id(7L).build();
        when(userRepository.getReferenceById(7L)).thenReturn(actorReference);
        LocalDateTime before = LocalDateTime.now();

        new PackageDeletionAuditServiceImpl(auditLogRepository, userRepository)
                .registerDeletion(ACTOR, "ENV-001", PackageStatus.ASSIGNED);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        AuditLog saved = captor.getValue();

        assertThat(saved.getActor()).isSameAs(actorReference);
        assertThat(saved.getUsuarioAfectado()).isNull();
        assertThat(saved.getAction()).isEqualTo(AuditAction.PACKAGE_DELETED.getCode());
        assertThat(saved.getDetails()).isEqualTo(
                "El Administrador de Ventas 'Ana Ventas' (documento CEDULA-1-1111-1111) eliminó el paquete "
                        + "'ENV-001' (estado: ASIGNADO).");
        assertThat(saved.getTimestamp()).isBetween(before, LocalDateTime.now());
    }
}
