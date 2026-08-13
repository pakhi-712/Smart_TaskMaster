package com.taskmanager.service;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.TaskDTO.SubtaskDTO;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.entity.*;
import com.taskmanager.repository.SubtaskRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SubtaskRepository subtaskRepository;
    private final AiService aiService;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository,
                       SubtaskRepository subtaskRepository,
                       AiService aiService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.subtaskRepository = subtaskRepository;
        this.aiService = aiService;
    }

    // ---- CRUD Operations ----

    public List<TaskDTO> getAllTasks(Long userId) {
        return taskRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).toList();
    }

    public TaskDTO getTaskById(Long taskId, Long userId) {
        Task task = findTaskOwnedByUser(taskId, userId);
        return toDTO(task);
    }

    public TaskDTO createTask(TaskRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TaskPriority priority = request.priority() != null 
                ? request.priority() 
                : generatePriority(null, request.priority(), request);
        Task task = new Task(
            request.title(),
            request.description(),
            priority,
            request.category(),
            request.dueDate(),
            user
        );

        Task saved = taskRepository.save(task);

        // If subtasks were provided in the request, create them
        if (request.subtasks() != null && !request.subtasks().isEmpty()) {
            for (String subtaskText : request.subtasks()) {
                if (subtaskText != null && !subtaskText.isBlank()) {
                    Subtask subtask = new Subtask(subtaskText.trim(), saved);
                    subtaskRepository.save(subtask);
                }
            }
        }

        // Reload to include subtasks in the response
        return toDTO(taskRepository.findById(saved.getId()).orElse(saved));
    }
    public TaskPriority generatePriority(TaskPriority old_p, TaskPriority new_p, TaskRequest request)
    {
    	if(new_p!=null)
    		return new_p;
    	try {
            return aiService.suggestPriority(
                request.title(),
                request.description(),
                request.category(),
                request.dueDate()
            );
        } catch (Exception e) {
            // Fallback logic if AI fails
            if (old_p == null) {
                return TaskPriority.MEDIUM;
            } else {
            	System.out.println("fallback to original");
                return old_p;
            }
        }
    }

    public TaskDTO updateTask(Long taskId, TaskRequest request, Long userId) {
        Task task = findTaskOwnedByUser(taskId, userId);
        TaskPriority old_p=task.getPriority();

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(generatePriority(old_p,request.priority(),request));
        task.setCategory(request.category());
        task.setDueDate(request.dueDate());

        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    public TaskDTO toggleStatus(Long taskId, Long userId) {
        Task task = findTaskOwnedByUser(taskId, userId);

        if (task.getStatus() == TaskStatus.PENDING) {
            task.setStatus(TaskStatus.COMPLETED);
        } else {
            task.setStatus(TaskStatus.PENDING);
        }

        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    public void deleteTask(Long taskId, Long userId) {
        Task task = findTaskOwnedByUser(taskId, userId);
        taskRepository.delete(task);
    }


    // Add a new subtask to an existing task
    public TaskDTO addSubtask(Long taskId, String text, Long userId) {
        Task task = findTaskOwnedByUser(taskId, userId);

        Subtask subtask = new Subtask(text.trim(), task);
        subtaskRepository.save(subtask);

        return toDTO(taskRepository.findById(taskId).orElse(task));
    }

    public TaskDTO toggleSubtask(Long taskId, Long subtaskId, Long userId) {
        Task task = findTaskOwnedByUser(taskId, userId);

        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new RuntimeException("Subtask not found"));

        if (!subtask.getTask().getId().equals(taskId)) {
            throw new RuntimeException("Subtask does not belong to this task");
        }

        subtask.setCompleted(!subtask.isCompleted());
        subtaskRepository.save(subtask);

        List<Subtask> allSubtasks = subtaskRepository.findByTaskIdOrderByIdAsc(taskId);
        if (!allSubtasks.isEmpty()) {
            boolean allCompleted = allSubtasks.stream().allMatch(Subtask::isCompleted);
            if (allCompleted && task.getStatus() == TaskStatus.PENDING) {
                task.setStatus(TaskStatus.COMPLETED);
                taskRepository.save(task);
            }
        }

        return toDTO(taskRepository.findById(taskId).orElse(task));
    }

    public TaskDTO deleteSubtask(Long taskId, Long subtaskId, Long userId) {
        findTaskOwnedByUser(taskId, userId);

        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new RuntimeException("Subtask not found"));

        if (!subtask.getTask().getId().equals(taskId)) {
            throw new RuntimeException("Subtask does not belong to this task");
        }

        subtaskRepository.delete(subtask);
        return toDTO(taskRepository.findById(taskId).orElse(null));
    }


    public List<TaskDTO> getTasksByStatus(Long userId, TaskStatus status) {
        return taskRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status)
                .stream().map(this::toDTO).toList();
    }

    public List<TaskDTO> getTasksByPriority(Long userId, TaskPriority priority) {
        return taskRepository.findByUserIdAndPriorityOrderByCreatedAtDesc(userId, priority)
                .stream().map(this::toDTO).toList();
    }

    public List<TaskDTO> searchTasks(Long userId, String keyword) {
        return taskRepository.searchByKeyword(userId, keyword)
                .stream().map(this::toDTO).toList();
    }

    private Task findTaskOwnedByUser(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: this task belongs to another user");
        }
        return task;
    }

    private TaskDTO toDTO(Task task) {
        List<SubtaskDTO> subtaskDTOs = subtaskRepository
                .findByTaskIdOrderByIdAsc(task.getId())
                .stream()
                .map(s -> new SubtaskDTO(s.getId(), s.getText(), s.isCompleted()))
                .toList();

        return new TaskDTO(
            task.getId(),
            task.getTitle(),
            task.getDescription(),
            task.getStatus(),
            task.getPriority(),
            task.getCategory(),
            task.getDueDate(),
            task.getCreatedAt(),
            task.getUpdatedAt(),
            subtaskDTOs
        );
    }
}