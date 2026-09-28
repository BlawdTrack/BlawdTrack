package com.blawdgourmet.blawdtrack.auth.entity;

import java.time.LocalDateTime;

import com.blawdgourmet.blawdtrack.users.model.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Solicitud de recuperación de contraseña (Task #62).
 * <p>
 * {@code tokenHash} guarda únicamente el hash del token (con el mismo
 * {@link org.springframework.security.crypto.password.PasswordEncoder} que ya
 * usa el proyecto para {@code contrasena_hash}), nunca el valor plano: ese
 * valor solo existe en memoria, se devuelve en el resultado del service para
 * que otra task lo use al enviar el correo, y no se persiste.
 */
@Entity
@Table(name = "tokens_recuperacion_contrasena")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime expirationDate;

    @Column(name = "usado", nullable = false)
    @Builder.Default
    private boolean used = false;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime createdAt;

    public boolean isUsado() {
        return used;
    }

    public LocalDateTime getFechaExpiracion() {
        return expirationDate;
    }
}
