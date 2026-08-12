package com.taskmanager.repository;

import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// JpaRepository<User, Long> means: "this repository manages User entities,
// and their primary key is of type Long"
// You get findAll(), findById(), save(), delete() for FREE — no code needed.
// You only write methods for custom queries.
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring reads this method name and auto-generates:
    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // SELECT COUNT(*) > 0 FROM users WHERE email = ?
    boolean existsByEmail(String email);
}