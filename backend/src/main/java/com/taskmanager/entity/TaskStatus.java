package com.taskmanager.entity;

// An enum is a fixed set of options — like a dropdown with only these choices.
// In the database, this gets stored as the string "PENDING" or "COMPLETED".
public enum TaskStatus {
    PENDING,
    COMPLETED
}