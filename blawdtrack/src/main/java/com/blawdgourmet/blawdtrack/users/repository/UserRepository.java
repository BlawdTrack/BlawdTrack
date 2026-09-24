package com.blawdgourmet.blawdtrack.users.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.dto.UserSessionState;
import com.blawdgourmet.blawdtrack.users.model.User;

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

    /**
     * Estado y versión de token de un usuario, sin cargar su rol ni los permisos.
     * Lo consulta el filtro JWT en cada petición para validar que la sesión sigue vigente.
     */
    @Query("select u.status as status, u.tokenVersion as tokenVersion from User u where u.id = :id")
    Optional<UserSessionState> findSessionStateById(@Param("id") Long id);

    Optional<User> findByDocumentTypeAndDocumentNumber(DocumentType documentType, String documentNumber);

    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByDocumentTypeAndDocumentNumber(DocumentType documentType, String documentNumber);
    boolean existsByPhone(String phone);

    // Excluyen al propio usuario para no dar un 409 falso al guardar sin cambios.
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
    boolean existsByPhoneAndIdNot(String phone, Long id);
}
