package com.taskmanager.security;

import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Step 1: Get the Authorization header from the incoming request
        // Example header: "Bearer eyJhbGciOiJIUzI1NiJ9..."
        String authHeader = request.getHeader("Authorization");

        // Step 2: Check if the header exists and starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            // Step 3: Extract just the token part (remove "Bearer " prefix)
            String token = authHeader.substring(7);

            // Step 4: Is this token valid (not expired, not tampered)?
            if (jwtUtil.validateToken(token)) {

                // Step 5: Extract the userId from the token
                Long userId = jwtUtil.getUserIdFromToken(token);

                // Step 6: Load the full User from the database
                User user = userRepository.findById(userId).orElse(null);

                if (user != null) {
                    // Step 7: Wrap the User in a UserPrincipal
                    UserPrincipal principal = UserPrincipal.fromUser(user);

                    // Step 8: Tell Spring Security "this request is authenticated"
                    // This is the critical line — without it, Spring rejects the request
                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                            principal,              // the authenticated user
                            null,                   // credentials (not needed after auth)
                            Collections.emptyList() // authorities/roles (empty for us)
                        );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }

        // Step 9: Pass the request to the next filter in the chain
        // If we set authentication above → request proceeds to the controller
        // If we didn't → Spring Security sees no authentication → returns 401
        filterChain.doFilter(request, response);
    }
}