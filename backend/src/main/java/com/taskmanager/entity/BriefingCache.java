package com.taskmanager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "briefing_cache")
public class BriefingCache {

    @Id
    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String briefingText;

    // JSON string: [{"id":1,"title":"...","status":"PENDING"}, ...]
    @Column(columnDefinition = "TEXT")
    private String taskSnapshot;

    private LocalDateTime generatedAt;

    public BriefingCache() {}

    public BriefingCache(Long userId, String briefingText, String taskSnapshot) {
        this.userId = userId;
        this.briefingText = briefingText;
        this.taskSnapshot = taskSnapshot;
        this.generatedAt = LocalDateTime.now();
    }

    public Long getUserId() { return userId; }
    public String getBriefingText() { return briefingText; }
    public String getTaskSnapshot() { return taskSnapshot; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }

    public void setBriefingText(String briefingText) { this.briefingText = briefingText; }
    public void setTaskSnapshot(String taskSnapshot) { this.taskSnapshot = taskSnapshot; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}