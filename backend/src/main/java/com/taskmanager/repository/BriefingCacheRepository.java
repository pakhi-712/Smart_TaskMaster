package com.taskmanager.repository;

import com.taskmanager.entity.BriefingCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BriefingCacheRepository extends JpaRepository<BriefingCache, Long> {
    Optional<BriefingCache> findByUserId(Long userId);
}