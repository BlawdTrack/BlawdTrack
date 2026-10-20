package com.blawdgourmet.blawdtrack.users.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminDetailResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminSummaryResponse;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/** Consultas de administradores: la lista, el perfil de uno y sus historiales. Solo lectura. */
@Service
@RequiredArgsConstructor
public class AdminQueryService {

    private final UserRepository userRepository;
    private final AdminAuditHistory auditHistory;
    private final AdminLookup lookup;
    private final AdminSessionPolicy sessionPolicy;

    @Transactional(readOnly = true)
    public List<AdminSummaryResponse> list() {
        return userRepository.findByRole_NameOrderByFullNameAsc(RoleName.SALES_ADMIN).stream()
                .map(admin -> new AdminSummaryResponse(
                        admin.getId(),
                        admin.getDocumentType(),
                        admin.getDocumentNumber(),
                        admin.getFullName(),
                        admin.getEmail(),
                        admin.getPhone(),
                        admin.getStatus(),
                        sessionPolicy.hasActiveSession(admin)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminDetailResponse findAdministrator(DocumentType documentType, String documentNumber) {
        return AdminDetailResponse.from(lookup.findSalesAdministrator(documentType, documentNumber));
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> getAuditLog() {
        return auditHistory.adminHistory();
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> getAdministratorHistory(DocumentType documentType, String documentNumber) {
        var admin = lookup.findSalesAdministrator(documentType, documentNumber);
        return auditHistory.adminHistory(admin.getId());
    }
}
