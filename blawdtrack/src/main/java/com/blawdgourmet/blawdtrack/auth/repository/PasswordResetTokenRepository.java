package com.blawdgourmet.blawdtrack.auth.repository;

import com.blawdgourmet.blawdtrack.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Persistencia de solicitudes de recuperación de contraseña (Task #62).
 * <p>
 * Sin métodos de búsqueda por ahora: esta task solo crea tokens. La consulta
 * por token (para validarlo/consumirlo) corresponde a la task de confirmación
 * de recuperación, fuera de este alcance.
 */
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
}
