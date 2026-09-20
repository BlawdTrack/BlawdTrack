package com.blawdgourmet.blawdtrack.auth.entity;

import com.blawdgourmet.blawdtrack.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
    private LocalDateTime fechaExpiracion;

    @Column(name = "usado", nullable = false)
    @Builder.Default
    private boolean usado = false;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
}
