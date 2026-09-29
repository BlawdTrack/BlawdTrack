package com.blawdgourmet.blawdtrack.users.repository;

import com.blawdgourmet.blawdtrack.users.model.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserPermissionRepository extends JpaRepository<UserPermission, Long> {
    List<UserPermission> findByUserId(Long userId);

    /** Trae el permiso en la misma consulta: se usa fuera de una transacción (filtro JWT). */
    @Query("select up from UserPermission up join fetch up.permission where up.user.id = :userId")
    List<UserPermission> findWithPermissionByUserId(@Param("userId") Long userId);

    Optional<UserPermission> findByUserIdAndPermissionId(Long userId, Long permissionId);
    void deleteByUserId(Long userId);
}
