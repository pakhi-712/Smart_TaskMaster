package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // All tasks belonging to a specific user
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Filter by status (e.g., show only PENDING tasks)
    List<Task> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, TaskStatus status);

    // Filter by priority
    List<Task> findByUserIdAndPriorityOrderByCreatedAtDesc(Long userId, TaskPriority priority);

    // Search by keyword in title or description
    // @Query lets you write custom JPQL (Java's version of SQL that works on entities)
    // LOWER() makes the search case-insensitive
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "AND (LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Task> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);

    // Dashboard stats helpers
    long countByUserIdAndStatus(Long userId, TaskStatus status);
    long countByUserIdAndPriority(Long userId, TaskPriority priority);

    // Count overdue tasks: due date is in the past AND status is still PENDING
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId " +
           "AND t.status = 'PENDING' AND t.dueDate < :today")
    long countOverdue(@Param("userId") Long userId, @Param("today") LocalDate today);

    // Activity streak: find all completed tasks with their completion dates
    // Returns tasks completed in the last 365 days
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "AND t.status = 'COMPLETED' " +
           "AND t.updatedAt >= :since")
    List<Task> findCompletedSince(@Param("userId") Long userId,
                                   @Param("since") java.time.LocalDateTime since);
}