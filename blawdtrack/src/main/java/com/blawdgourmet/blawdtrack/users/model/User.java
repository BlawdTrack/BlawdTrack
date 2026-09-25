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
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
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
    @Column(name = "tipo_documento", nullable = false, length = 20)
    private DocumentType documentType;

    @Column(name = "numero_documento", nullable = false, length = 20)
    private String documentNumber;

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

    @Setter(AccessLevel.NONE)
    @Column(name = "version_token", nullable = false)
    @Builder.Default
    private int tokenVersion = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private Role role;

    public boolean isActive() {
        return this.status == UserStatus.ACTIVE;
    }

    /**
     * Cambia el estado de la cuenta y cierra las sesiones ya emitidas: si el estado
     * realmente cambia, incrementa la versión del token. Si el nuevo estado es igual
     * al actual no hace nada. Usar este método en lugar de {@code setStatus}, que no
     * incrementa la versión.
     */
    public void changeStatus(UserStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("El estado no puede ser nulo");
        }
        if (this.status == newStatus) {
            return;
        }
        this.status = newStatus;
        this.tokenVersion++;
    }
}
