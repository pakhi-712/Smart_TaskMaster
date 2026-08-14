package com.taskmanager.dto;

public record DashboardStats(
    long total,
    long pending,
    long completed,
    long highPriority,
    long overdue
) {}
