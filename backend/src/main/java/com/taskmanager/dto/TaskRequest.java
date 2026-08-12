package com.taskmanager.dto;

import com.taskmanager.entity.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;

public record TaskRequest(
    @NotBlank(message = "Title cannot be empty")
    String title,
    String description,
    TaskPriority priority,
    String category,
    LocalDate dueDate,
    List<String> subtasks      // list of subtask texts when creating a task
) {}