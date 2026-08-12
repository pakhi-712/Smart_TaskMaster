package com.taskmanager.dto;

import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TaskDTO(
    Long id,
    String title,
    String description,
    TaskStatus status,
    TaskPriority priority,
    String category,
    LocalDate dueDate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<SubtaskDTO> subtasks
) {
    // Nested record for subtask data
    public record SubtaskDTO(
        Long id,
        String text,
        boolean completed
    ) {}
}