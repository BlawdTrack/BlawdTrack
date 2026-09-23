package com.blawdgourmet.blawdtrack.audit.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private static final String ACCION_CREAR_ADMINISTRADOR = "CREAR_ADMINISTRADOR";

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    public void registrarCreacionAdministrador(AuthenticatedUser actor, User administradorCreado) {

        User actorReferencia = userRepository.getReferenceById(actor.id());

        String detalle = "The Super User '%s' (ID %s) created the Sales Administrator '%s' (ID %s, email %s)."
                .formatted(actor.nombreCompleto(), actor.cedula(),
                        administradorCreado.getFullName(), administradorCreado.getDocumentId(),
                        administradorCreado.getEmail());

        AuditLog registro = AuditLog.builder()
                .actor(actorReferencia)
                .usuarioAfectado(administradorCreado)
                .action(ACCION_CREAR_ADMINISTRADOR)
                .details(detalle)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(registro);
    }
}
