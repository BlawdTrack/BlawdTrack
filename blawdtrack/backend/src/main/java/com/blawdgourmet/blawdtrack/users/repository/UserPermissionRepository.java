package com.blawdgourmet.blawdtrack.users.repository;

import com.blawdgourmet.blawdtrack.users.model.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/** Excepciones individuales de permisos por usuario (tabla {@code usuarios_permisos}). */
public interface UserPermissionRepository extends JpaRepository<UserPermission, Long> {
    /** Todas las excepciones de un usuario. */
    List<UserPermission> findByUserId(Long userId);
    /** La excepción de un usuario sobre un permiso concreto, si existe. */

    /** Trae el permiso en la misma consulta: se usa fuera de una transacción (filtro JWT). */
    @Query("select up from UserPermission up join fetch up.permission where up.user.id = :userId")
    List<UserPermission> findWithPermissionByUserId(@Param("userId") Long userId);

    Optional<UserPermission> findByUserIdAndPermissionId(Long userId, Long permissionId);
    /** Elimina todas las excepciones del usuario (vuelve a los permisos de su rol). */
    void deleteByUserId(Long userId);
}
