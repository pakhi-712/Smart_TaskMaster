package com.taskmanager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String securityQuestion;
    
    @Column(nullable = false)
    private String securityAnswer;

    private LocalDateTime createdAt;

    // ---- Constructors ----

    // Empty constructor — JPA requires this.
    // When JPA loads a row from the database, it first creates an empty User object
    // using this constructor, then fills in the fields one by one using setters.
    public User() {}

    // Full constructor — used when YOU create a User in your code.
    // We skip 'id' (database generates it) and 'createdAt' (@PrePersist handles it).
    public User(String email, String password, String name, String securityQuestion, String securityAnswer) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.securityAnswer=securityAnswer;
        this.securityQuestion=securityQuestion;}

    // ---- Getters ----
    // These let other classes READ the fields.
    // Fields are private (nobody can do user.email directly),
    // but getters provide controlled access (user.getEmail()).

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getName() { return name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getSecurityQuestion() {return securityQuestion; }
    public String getSecurityAnswer() {return securityAnswer; }

    // ---- Setters ----
    // These let other classes CHANGE the fields.
    // No setter for 'id' — once the database assigns it, it should never change.
    // No setter for 'createdAt' — @PrePersist handles it automatically.

    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setName(String name) { this.name = name; }
    public void setSecurityQuestion() { this.securityQuestion=securityQuestion; }
    public void setSecurityAnswer() { this.securityAnswer = securityAnswer; }
    
    // ---- Lifecycle hook ----

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}