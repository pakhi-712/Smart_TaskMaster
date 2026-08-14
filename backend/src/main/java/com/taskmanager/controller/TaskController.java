package com.taskmanager.controller;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.DashboardStats;
import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) String keyword) {

        List<TaskDTO> tasks;

        if (keyword != null && !keyword.isBlank()) {
            tasks = taskService.searchTasks(user.getId(), keyword);
        } else if (status != null) {
            tasks = taskService.getTasksByStatus(user.getId(), status);
        } else if (priority != null) {
            tasks = taskService.getTasksByPriority(user.getId(), priority);
        } else {
            tasks = taskService.getAllTasks(user.getId());
        }

        // returns json of all tasks added
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats(
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(taskService.getStats(user.getId()));
    }
    
    // gets the "id" numbered task for the specific user
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(taskService.getTaskById(id, user.getId()));
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        TaskDTO created = taskService.createTask(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(taskService.updateTask(id, request, user.getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDTO> toggleStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(taskService.toggleStatus(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user) {
        taskService.deleteTask(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    // functions for substacks within each task
    @PostMapping("/{id}/subtasks")
    public ResponseEntity<TaskDTO> addSubtask(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal user) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.addSubtask(id, text, user.getId()));
    }

    @PatchMapping("/{taskId}/subtasks/{subtaskId}")
    public ResponseEntity<TaskDTO> toggleSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(
                taskService.toggleSubtask(taskId, subtaskId, user.getId()));
    }

    @DeleteMapping("/{taskId}/subtasks/{subtaskId}")
    public ResponseEntity<TaskDTO> deleteSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(
                taskService.deleteSubtask(taskId, subtaskId, user.getId()));
    }
}
