package com.taskmanager.repository;

import com.taskmanager.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubtaskRepository extends JpaRepository<Subtask, Long> {

    // List of subtasks
    List<Subtask> findByTaskIdOrderByIdAsc(Long taskId);

    // Count how many subtasks are not completed for a task
    long countByTaskIdAndCompleted(Long taskId, boolean completed);
}