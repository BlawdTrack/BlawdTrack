package com.blawdgourmet.blawdtrack.users.repository;

import com.blawdgourmet.blawdtrack.users.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Busca un usuario por su correo electrónico, cargando en la misma consulta
     * su rol y los permisos de ese rol (Task #52 / CU-001: consulta de usuario
     * por correo para autenticación).
     * <p>
     * El estado del usuario ({@code estado}) no requiere fetch adicional: es una
     * columna simple de la propia fila de {@code usuarios}, no una relación.
     * <p>
     * {@code role} es {@code @ManyToOne(EAGER)} y Hibernate ya lo trae con JOIN
     * por defecto, pero {@code role.permissions} es una colección
     * {@code @ManyToMany(EAGER)} que, sin este {@link EntityGraph}, Hibernate
     * cargaría con un SELECT adicional. Como los permisos se necesitan siempre
     * que se autentica un usuario (validaciones {@code @PreAuthorize}), se
     * incluyen aquí para evitar esa segunda consulta.
     */
    @EntityGraph(attributePaths = {"role", "role.permissions"})
    Optional<User> findByEmail(String email);

    Optional<User> findByNationalId(String nationalId);
    boolean existsByEmail(String email);
    boolean existsByNationalId(String nationalId);
}
