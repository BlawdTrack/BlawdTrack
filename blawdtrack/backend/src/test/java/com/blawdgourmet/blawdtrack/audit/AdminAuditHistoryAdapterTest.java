package com.blawdgourmet.blawdtrack.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.audit.service.AdminAuditHistoryAdapter;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

@ExtendWith(MockitoExtension.class)
class AdminAuditHistoryAdapterTest {

    @Mock private AuditLogRepository auditLogRepository;
    @InjectMocks private AdminAuditHistoryAdapter adapter;

    @Test
    void adminHistoryReturnsEveryAdminEntryNewestFirst() {
        User actor = User.builder()
                .id(5L)
                .documentType(DocumentType.CEDULA)
                .documentNumber("1-2345-6789")
                .fullName("Ana Perez")
                .email("ana@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(Role.builder().name(RoleName.SUPER_USER).build())
                .build();
        AuditLog creacion = AuditLog.builder()
                .id(1L)
                .actor(actor)
                .action("CREAR_ADMINISTRADOR")
                .details("El Super Usuario creó al Administrador X.")
                .timestamp(LocalDateTime.now())
                .build();
        AuditLog eliminacion = AuditLog.builder()
                .id(2L)
                .actor(actor)
                .action("ELIMINAR_ADMINISTRADOR")
                .details("El Super Usuario eliminó al Administrador Y.")
                .timestamp(LocalDateTime.now().minusDays(1))
                .build();
        // La bitácora de administradores incluye creación, eliminación y, desde la HU-007, sus modificaciones.
        when(auditLogRepository.findByActionInOrderByTimestampDesc(argThat(actions -> actions != null
                && actions.containsAll(List.of("CREAR_ADMINISTRADOR", "ELIMINAR_ADMINISTRADOR",
                        "ACTUALIZAR_ADMINISTRADOR", "ACTIVAR_ADMINISTRADOR", "DESACTIVAR_ADMINISTRADOR",
                        "CAMBIAR_CONTRASENA_ADMINISTRADOR")))))
                .thenReturn(List.of(creacion, eliminacion));

        List<AdminAuditLogResponse> respuesta = adapter.adminHistory();

        assertThat(respuesta).hasSize(2);
        assertThat(respuesta.get(0).action()).isEqualTo("CREAR_ADMINISTRADOR");
        assertThat(respuesta.get(0).actorName()).isEqualTo(actor.getFullName());
        assertThat(respuesta.get(0).details()).isEqualTo(creacion.getDetails());
        assertThat(respuesta.get(1).action()).isEqualTo("ELIMINAR_ADMINISTRADOR");
    }

    @Test
    void adminHistoryOfOneAdminAsksOnlyForThatAdminAndMapsTheEntries() {
        User actor = User.builder()
                .id(5L)
                .documentType(DocumentType.CEDULA)
                .documentNumber("1-2345-6789")
                .fullName("Ana Perez")
                .email("ana@example.test")
                .passwordHash("hash")
                .status(UserStatus.ACTIVE)
                .role(Role.builder().name(RoleName.SUPER_USER).build())
                .build();
        AuditLog cambio = AuditLog.builder()
                .id(3L)
                .actor(actor)
                .action("ACTUALIZAR_ADMINISTRADOR")
                .details("El Super Usuario modificó los datos (nombre) del Administrador X.")
                .timestamp(LocalDateTime.now())
                .build();
        when(auditLogRepository.findByUsuarioAfectadoIdAndActionInOrderByTimestampDescIdDesc(eq(9L), anyCollection()))
                .thenReturn(List.of(cambio));

        List<AdminAuditLogResponse> respuesta = adapter.adminHistory(9L);

        assertThat(respuesta).hasSize(1);
        assertThat(respuesta.get(0).action()).isEqualTo("ACTUALIZAR_ADMINISTRADOR");
        assertThat(respuesta.get(0).actorName()).isEqualTo(actor.getFullName());
    }
}
