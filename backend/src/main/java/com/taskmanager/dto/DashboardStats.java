package com.taskmanager.dto;

// What the dashboard cards display — just counts.
// The frontend hits GET /api/tasks/stats and gets this back.
public record DashboardStats(
    long total,
    long pending,
    long completed,
    long highPriority,
    long overdue       // tasks past their due date that aren't completed
) {}