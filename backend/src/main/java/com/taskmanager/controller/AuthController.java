package com.taskmanager.controller;

import com.taskmanager.dto.AuthDTO.*;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // catches the specific registration HTTP call
    @PostMapping("/register")
    // @RequestBody takes the raw JSON string Axios sent and maps it directly into our Java RegisterRequest DTO.
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        if (!request.password().equals(request.confirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Passwords do not match"));
        }

        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }

        User user = new User(
            request.email(),
            passwordEncoder.encode(request.password()),
            request.name(),
            request.securityQuestion(),
            passwordEncoder.encode(request.securityAnswer().toLowerCase().trim())
        );

        // stores the new user into the database as SQL (Spring JPA), provides the ID to each entry (table)
        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, saved.getName(), saved.getEmail()));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getEmail()));
    }

    // POST /api/auth/forgot-password
    // Step 1: User enters their email → we return their security question
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.ok(new SecurityQuestionResponse("No account found with this email"));
        }

        return ResponseEntity.ok(new SecurityQuestionResponse(user.getSecurityQuestion()));
    }

    // POST /api/auth/reset-password
    // Step 2: User answers the question + provides new password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid request"));
        }

        // Check if the security answer matches (case-insensitive, trimmed)
        if (!passwordEncoder.matches(
                request.securityAnswer().toLowerCase().trim(),
                user.getSecurityAnswer())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Incorrect security answer"));
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successful. You can now log in."));
    }
}