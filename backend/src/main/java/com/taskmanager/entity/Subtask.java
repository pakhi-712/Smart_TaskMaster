package com.taskmanager.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "subtasks")
public class Subtask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private boolean completed = false;

    // Many subtasks belong to one task
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    public Subtask() {}

    public Subtask(String text, Task task) {
        this.text = text;
        this.completed = false;
        this.task = task;
    }

    // getters
    public Long getId() { return id; }
    public String getText() { return text; }
    public boolean isCompleted() { return completed; }
    public Task getTask() { return task; }

    // setters
    public void setText(String text) { this.text = text; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public void setTask(Task task) { this.task = task; }
}