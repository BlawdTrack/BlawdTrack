package com.blawdgourmet.blawdtrack.users.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Rol de un usuario (ver {@code RoleName}) con el conjunto de permisos que le corresponden. Los
 * permisos se cargan siempre junto con el rol ({@code EAGER}) porque se necesitan para construir las
 * autoridades en cada solicitud autenticada.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "descripcion", length = 150)
    private String description;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "roles_permisos",
        joinColumns = @JoinColumn(name = "rol_id"),
        inverseJoinColumns = @JoinColumn(name = "permiso_id")
    )
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();
}
