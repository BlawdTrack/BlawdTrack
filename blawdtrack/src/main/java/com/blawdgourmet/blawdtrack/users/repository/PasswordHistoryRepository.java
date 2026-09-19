package com.blawdgourmet.blawdtrack.users.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blawdgourmet.blawdtrack.users.model.PasswordHistory;
import com.blawdgourmet.blawdtrack.users.model.User;

public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Long> {
    List<PasswordHistory> findTop3ByUserOrderByCreatedAtDesc(User user);
}