package com.blawdgourmet.blawdtrack.users.repository;

import com.blawdgourmet.blawdtrack.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByNationalId(String nationalId);
    boolean existsByEmail(String email);
    boolean existsByNationalId(String nationalId);
}
