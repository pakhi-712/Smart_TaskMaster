package com.taskmanager.controller;

import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    // GET /api/ai/daily-briefing
    // Returns: { "briefing": "...", "cached": true/false }
    @GetMapping("/daily-briefing")
    public ResponseEntity<Map<String, Object>> getDailyBriefing(
            @AuthenticationPrincipal UserPrincipal user) {
        Map<String, Object> result = aiService.generateDailyBriefing(user.getId());
        return ResponseEntity.ok(result);
    }
}