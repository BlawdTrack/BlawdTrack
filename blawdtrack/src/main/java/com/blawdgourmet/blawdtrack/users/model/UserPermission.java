package com.blawdgourmet.blawdtrack.users.model;

import jakarta.persistence.*;
import lombok.*;

/** Excepción individual al conjunto de permisos predeterminado del rol. */
@Entity
@Table(name = "usuarios_permisos", uniqueConstraints = @UniqueConstraint(
        name = "uq_usuarios_permisos_usuario_permiso",
        columnNames = {"usuario_id", "permiso_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "permiso_id", nullable = false)
    private Permission permission;

    @Column(name = "permitido", nullable = false)
    private boolean allowed;
}
