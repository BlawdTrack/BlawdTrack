package com.blawdgourmet.blawdtrack.auth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blawdgourmet.blawdtrack.auth.entity.PasswordHistory;
import com.blawdgourmet.blawdtrack.users.model.User;

public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Long> {

    List<PasswordHistory> findTop2ByUserOrderByCreatedAtDesc(User user);
}
