package com.taskmanager.service;

import com.taskmanager.entity.BriefingCache;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.repository.BriefingCacheRepository;
import com.taskmanager.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final TaskRepository taskRepository;
    private final BriefingCacheRepository briefingCacheRepository;
    private final WebClient webClient;
    private final String apiKey;

    public AiService(TaskRepository taskRepository,
                     BriefingCacheRepository briefingCacheRepository,
                     @Value("${app.ai.api-key}") String apiKey) {
        this.taskRepository = taskRepository;
        this.briefingCacheRepository = briefingCacheRepository;
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    // ================================================================
    // FEATURE 1: Auto priority assignment using Eisenhower Matrix
    // Called by TaskService when user creates a task without picking a priority
    // ================================================================
    public TaskPriority suggestPriority(String title, String description,
                                        String category, LocalDate dueDate) {
        // Calculate urgency based on deadline proximity
        String urgencyContext = "No deadline set";
        if (dueDate != null) {
            long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), dueDate);
            if (daysUntilDue < 0) {
                urgencyContext = "OVERDUE by " + Math.abs(daysUntilDue) + " days";
            } else if (daysUntilDue == 0) {
                urgencyContext = "Due TODAY";
            } else {
                urgencyContext = "Due in " + daysUntilDue + " days";
            }
        }

        String prompt = "You are a task prioritization assistant using the Eisenhower Matrix.\n\n" +
                "TASK:\n" +
                "Title: " + title + "\n" +
                "Description: " + (description != null ? description : "None") + "\n" +
                "Category: " + (category != null ? category : "General") + "\n" +
                "Deadline: " + urgencyContext + "\n\n" +
                "RULES:\n" +
                "- URGENCY: Overdue or due within 2 days = URGENT. Due within 7 days = MODERATE. Beyond 7 days or no deadline = NOT URGENT.\n" +
                "- IMPACT for WORK tasks: business impact, stakeholder visibility, consequences of delay.\n" +
                "- IMPACT for PERSONAL tasks: health, relationships, legal/financial consequences.\n" +
                "- Urgent + High Impact = HIGH\n" +
                "- Urgent + Low Impact = MEDIUM\n" +
                "- Not Urgent + High Impact = MEDIUM\n" +
                "- Not Urgent + Low Impact = LOW\n\n" +
                "Respond with ONLY one word: HIGH, MEDIUM, or LOW";

        String response = callAiApi(prompt);

        // Parse the response — look for HIGH, MEDIUM, or LOW
        if (response != null) {
            String cleaned = response.trim().toUpperCase();
            if (cleaned.contains("HIGH")) return TaskPriority.HIGH;
            if (cleaned.contains("LOW")) return TaskPriority.LOW;
        }
        return TaskPriority.MEDIUM; // Default fallback
    }
    public Map<String, Object> generateDailyBriefing(Long userId) {


        List<Task> pendingTasks = taskRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, TaskStatus.PENDING);

        if (pendingTasks.isEmpty()) {
            return Map.of(
                "briefing", "You have no pending tasks. Enjoy your free time!",
                "cached", false
            );
        }

        String currentSnapshot = buildSnapshot(pendingTasks);
        Optional<BriefingCache> cachedOpt = briefingCacheRepository.findByUserId(userId);

        if (cachedOpt.isPresent()) {
            BriefingCache cached = cachedOpt.get();
            String oldSnapshot = cached.getTaskSnapshot();

            if (currentSnapshot.equals(oldSnapshot)) {
                return Map.of(
                    "briefing", cached.getBriefingText(),
                    "cached", true
                );
            }

            String diff = computeDiff(oldSnapshot, currentSnapshot, pendingTasks);
            String diffPrompt = "You are a productivity assistant. " +
                    "Here was the user's previous daily briefing:\n\n" +
                    "\"" + cached.getBriefingText() + "\"\n\n" +
                    "Since then, the following changes occurred:\n" + diff + "\n\n" +
                    "Generate an updated briefing (3-4 sentences max). " +
                    "Acknowledge what was completed, highlight any new or remaining " +
                    "high-priority/overdue items, and suggest what to focus on next. " +
                    "Keep the tone motivating but natural.";

            String briefing = callAiApi(diffPrompt);
            updateCache(userId, briefing, currentSnapshot);

            return Map.of("briefing", briefing, "cached", false);
        }

        String fullPrompt = buildFullBriefingPrompt(pendingTasks);
        String briefing = callAiApi(fullPrompt);
        updateCache(userId, briefing, currentSnapshot);

        return Map.of("briefing", briefing, "cached", false);
    }

    private String buildSnapshot(List<Task> tasks) {
        return tasks.stream()
                .map(t -> t.getId() + ":" + t.getTitle() + ":" + t.getStatus())
                .sorted()
                .collect(Collectors.joining("|"));
    }

    private String computeDiff(String oldSnapshot, String newSnapshot, List<Task> currentTasks) {
        Set<String> oldIds = new HashSet<>();
        Map<String, String> oldTitles = new HashMap<>();

        if (oldSnapshot != null && !oldSnapshot.isEmpty()) {
            for (String entry : oldSnapshot.split("\\|")) {
                String[] parts = entry.split(":", 3);
                if (parts.length >= 2) {
                    oldIds.add(parts[0]);
                    oldTitles.put(parts[0], parts[1]);
                }
            }
        }

        Set<String> currentIds = currentTasks.stream()
                .map(t -> t.getId().toString())
                .collect(Collectors.toSet());

        StringBuilder diff = new StringBuilder();

        for (String oldId : oldIds) {
            if (!currentIds.contains(oldId)) {
                diff.append("- COMPLETED: '").append(oldTitles.get(oldId)).append("'\n");
            }
        }

        for (Task task : currentTasks) {
            if (!oldIds.contains(task.getId().toString())) {
                diff.append("- NEW: '").append(task.getTitle())
                    .append("' [").append(task.getPriority()).append("]\n");
            }
        }

        diff.append("- REMAINING: ").append(currentTasks.size()).append(" pending tasks");

        return diff.toString();
    }

    private String buildFullBriefingPrompt(List<Task> tasks) {
        StringBuilder taskList = new StringBuilder();
        for (Task task : tasks) {
            taskList.append("- ").append(task.getTitle());
            taskList.append(" [Priority: ").append(task.getPriority()).append("]");
            if (task.getDueDate() != null) {
                taskList.append(" [Due: ").append(task.getDueDate()).append("]");
                if (task.getDueDate().isBefore(LocalDate.now())) {
                    taskList.append(" [OVERDUE]");
                }
            }
            if (task.getCategory() != null && !task.getCategory().isBlank()) {
                taskList.append(" [Category: ").append(task.getCategory()).append("]");
            }
            taskList.append("\n");
        }

        return "You are a productivity assistant. The user has the following " +
                "pending tasks:\n\n" + taskList +
                "\nGenerate a brief, friendly daily briefing (3-4 sentences max). " +
                "Mention how many tasks they have, highlight any overdue or high-priority " +
                "items, and give a quick suggestion on what to tackle first. " +
                "Keep the tone motivating but not over-the-top.";
    }

    private void updateCache(Long userId, String briefing, String snapshot) {
        BriefingCache cache = briefingCacheRepository.findByUserId(userId)
                .orElse(new BriefingCache(userId, briefing, snapshot));
        cache.setBriefingText(briefing);
        cache.setTaskSnapshot(snapshot);
        cache.setGeneratedAt(java.time.LocalDateTime.now());
        briefingCacheRepository.save(cache);
    }

    private String callAiApi(String prompt) {
        try {
            Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                    Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 300
            );

            Map response = webClient.post()
                    .uri("/chat/completions")
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("choices")) {
                List<Map> choices = (List<Map>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map message = (Map) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            return "Could not generate response. Please try again.";
        } catch (Exception e) {
            System.out.println("AI ERROR: " + e.getMessage());
            return "AI service is currently unavailable. Check your task list for details.";
        }
    }
}