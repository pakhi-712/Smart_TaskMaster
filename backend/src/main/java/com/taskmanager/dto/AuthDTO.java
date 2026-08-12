package com.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthDTO() {

    public record RegisterRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword,

        @NotBlank(message = "Security question is required")
        String securityQuestion,

        @NotBlank(message = "Security answer is required")
        String securityAnswer
    ) {}

    public record LoginRequest(
        @NotBlank String email,
        @NotBlank String password
    ) {}

    public record AuthResponse(
        String token,
        String name,
        String email
    ) {}

    // Step 1 of forgot password: user enters email, gets back their security question
    public record ForgotPasswordRequest(
        @NotBlank @Email String email
    ) {}

    // What we send back: the security question for that email
    public record SecurityQuestionResponse(
        String securityQuestion
    ) {}

    // Step 2: user answers the question and sets a new password
    public record ResetPasswordRequest(
        @NotBlank @Email String email,
        @NotBlank String securityAnswer,
        @NotBlank @Size(min = 6) String newPassword
    ) {}
}