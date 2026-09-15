package com.blawdgourmet.blawdtrack.audit.model;

import java.time.LocalDateTime;

import com.blawdgourmet.blawdtrack.users.model.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
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
 * Registro de auditoría (estándar BD01/BD02/BD04/BD06). Existen dos relaciones distintas
 * con la tabla "usuarios" (quien ejecuta la acción y, opcionalmente, quien es afectado),
 * por lo que la segunda columna usa un nombre descriptivo ("usuario_afectado_id") en lugar
 * del nombre por defecto, según indica el estándar BD04.
 */
@Entity
@Table(name = "auditorias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_auditorias_usuario_id"))
    private User actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_afectado_id",
            foreignKey = @ForeignKey(name = "fk_auditorias_usuario_afectado_id"))
    private User usuarioAfectado;

    @Column(name = "accion", nullable = false, length = 100)
    private String action;

    @Column(name = "detalle", columnDefinition = "TEXT")
    private String details;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime timestamp;
}
