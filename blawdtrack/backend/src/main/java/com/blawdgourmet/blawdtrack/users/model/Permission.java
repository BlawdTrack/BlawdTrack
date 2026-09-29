package com.blawdgourmet.blawdtrack.users.model;

import jakarta.persistence.*;
import lombok.*;

/** Permiso que se puede asignar a un rol; se identifica por su código único (ver {@code PermissionCode}). */
@Entity
@Table(name = "permisos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "descripcion", length = 150)
    private String description;
}
