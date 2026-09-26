package com.blawdgourmet.blawdtrack.users.model;

import java.time.LocalDateTime;

import com.blawdgourmet.blawdtrack.users.constant.DocumentType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_usuarios_tipo_documento_numero_documento",
                columnNames = {"tipo_documento", "numero_documento"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", length = 20)
    private DocumentType documentType;

    @Column(name = "numero_documento", length = 50)
    private String documentNumber;

    @Deprecated
    @Column(name = "cedula", nullable = false, unique = true, length = 20)
    private String documentId;

    @PrePersist
    @PreUpdate
    void syncLegacyDocumentFields() {
        if (documentType != null && documentNumber != null && (documentId == null || documentId.isBlank())) {
            documentId = documentNumber;
        }
        if (documentType == null && documentId != null) {
            documentType = DocumentType.CEDULA;
        }
        if (documentNumber == null && documentId != null) {
            documentNumber = documentId;
        }
        if (documentId == null && documentNumber != null) {
            documentId = documentNumber;
        }
    }

    @Column(name = "nombre_completo", nullable = false, length = 120)
    private String fullName;

    @Column(name = "correo", nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "contrasena_hash", nullable = false)
    private String passwordHash;

    @Column(name = "telefono", unique = true, length = 20)
    private String phone;

    @Column(name = "fecha_ultimo_inicio_sesion")
    private LocalDateTime lastLoginAt;

    @Setter(AccessLevel.NONE)
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "token_version", nullable = false)
    @Builder.Default
    private int tokenVersion = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private Role role;

    public boolean isActive() {
        return this.status == UserStatus.ACTIVE;
    }

    public void changeStatus(UserStatus newStatus) {
        if (this.status == newStatus) {
            return;
        }
        this.status = newStatus;
        this.tokenVersion++;
    }
}
