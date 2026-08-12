package com.taskmanager.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    // @Value reads from application.properties.
    // "${app.jwt.secret}" looks for the line: app.jwt.secret=your-super-secret...
    // Spring injects those values into this constructor automatically.
    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {

        // Convert the string secret into a cryptographic key object.
        // HMAC-SHA requires the key to be at least 256 bits (32 characters).
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // ---- Generate a token ----
    // Called after successful login/register.
    // The token contains: userId, email, issue time, expiry time.
    public String generateToken(Long userId, String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId.toString())       // "sub" claim — who this token belongs to
                .claim("email", email)             // custom claim — extra data we want inside
                .issuedAt(now)                     // "iat" claim — when the token was created
                .expiration(expiry)                // "exp" claim — when it expires
                .signWith(key)                     // sign with our secret key
                .compact();                        // build the final token string
    }

    // ---- Extract userId from a token ----
    // Called by JwtAuthFilter to identify which user sent the request.
    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    // ---- Validate a token ----
    // Checks: is the signature valid? Is it expired?
    // Returns true if the token is good, false if anything is wrong.
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // JwtException covers: expired, malformed, wrong signature, etc.
            return false;
        }
    }

    // ---- Internal: parse and verify a token ----
    // This does the actual cryptographic verification.
    // If the token has been tampered with, the signature won't match and this throws.
    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)                   // verify using our secret key
                .build()
                .parseSignedClaims(token)           // parse + verify signature
                .getPayload();                      // extract the claims (data inside)
    }
}