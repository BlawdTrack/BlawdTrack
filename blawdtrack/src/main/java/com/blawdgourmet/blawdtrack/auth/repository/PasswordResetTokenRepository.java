package com.blawdgourmet.blawdtrack.auth.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.blawdgourmet.blawdtrack.auth.entity.PasswordResetToken;

import jakarta.persistence.LockModeType;

/**
 * Persistencia de solicitudes de recuperación de contraseña (Task #62).
 * <p>
 * Persistencia y consulta de tokens activos para su validación/consumo.
 */
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

	 @Lock(LockModeType.PESSIMISTIC_WRITE)
	 @Query("SELECT t FROM PasswordResetToken t WHERE t.usado = false AND t.fechaExpiracion > :ahora")
	 List<PasswordResetToken> findActivosParaActualizar(@Param("ahora") LocalDateTime ahora);
}
