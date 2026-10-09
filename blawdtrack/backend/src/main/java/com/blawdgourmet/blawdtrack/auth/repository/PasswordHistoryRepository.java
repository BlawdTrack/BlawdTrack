package com.blawdgourmet.blawdtrack.auth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blawdgourmet.blawdtrack.auth.entity.PasswordHistory;
import com.blawdgourmet.blawdtrack.users.model.User;

/** Acceso al historial de contraseñas de los usuarios (HU-002). */
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Long> {

    /** Las dos contraseñas anteriores más recientes del usuario, de la más nueva a la más antigua. */
    List<PasswordHistory> findTop2ByUserOrderByCreatedAtDesc(User user);

    void deleteByUserId(Long userId);
}
