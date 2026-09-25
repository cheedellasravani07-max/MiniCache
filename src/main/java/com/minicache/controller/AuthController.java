package com.minicache.controller;

import com.minicache.model.User;
import com.minicache.model.PasswordResetToken;
import com.minicache.repository.UserRepository;
import com.minicache.repository.PasswordResetTokenRepository;
import com.minicache.security.JwtService;
import com.minicache.dto.ResetPasswordRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthController(
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository) {

        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordResetTokenRepository =
                passwordResetTokenRepository;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody User user) {

        Map<String, Object> response =
                new HashMap<>();

        if (user.getUsername() == null ||
                user.getUsername().isBlank()) {

            response.put("success", false);
            response.put("message",
                    "Username cannot be empty");

            return ResponseEntity.badRequest()
                    .body(response);
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            response.put("success", false);
            response.put("message",
                    "Password cannot be empty");

            return ResponseEntity.badRequest()
                    .body(response);
        }

        if (userRepository.existsByUsername(
                user.getUsername())) {

            response.put("success", false);
            response.put("message",
                    "Username already exists");

            return ResponseEntity.badRequest()
                    .body(response);
        }

        String encodedPassword =
                passwordEncoder.encode(
                        user.getPassword()
                );

        User newUser = new User(
                user.getUsername(),
                encodedPassword
        );

        newUser.setEmail(user.getEmail());

        userRepository.save(newUser);

        response.put("success", true);
        response.put("message",
                "User registered successfully");

        return ResponseEntity.ok(response);
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody User user) {

        Map<String, Object> response =
                new HashMap<>();

        User existingUser =
                userRepository.findByUsername(
                        user.getUsername()
                ).orElse(null);

        if (existingUser == null ||
                !passwordEncoder.matches(
                        user.getPassword(),
                        existingUser.getPassword())) {

            response.put("success", false);
            response.put("message",
                    "Invalid username or password");

            return ResponseEntity
                    .status(401)
                    .body(response);
        }

        // Generate access token
        String token =
                jwtService.generateToken(
                        existingUser.getUsername()
                );

        // Generate refresh token
        String refreshToken =
                jwtService.generateRefreshToken(
                        existingUser.getUsername()
                );

        response.put("success", true);
        response.put("message",
                "Login successful");

        response.put("username",
                existingUser.getUsername());

        response.put("token", token);

        response.put("refreshToken",
                refreshToken);

        return ResponseEntity.ok(response);
    }

    // =========================
    // REFRESH TOKEN
    // =========================

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(
            @RequestBody Map<String, String> request) {

        Map<String, Object> response =
                new HashMap<>();

        String refreshToken =
                request.get("refreshToken");

        if (refreshToken == null ||
                refreshToken.isBlank()) {

            response.put("success", false);
            response.put("message",
                    "Refresh token is required");

            return ResponseEntity
                    .badRequest()
                    .body(response);
        }

        try {

            if (!jwtService.isTokenValid(refreshToken)) {

                response.put("success", false);
                response.put("message",
                        "Refresh token expired or invalid");

                return ResponseEntity
                        .status(401)
                        .body(response);
            }

            String username =
                    jwtService.extractUsername(
                            refreshToken
                    );

            String newAccessToken =
                    jwtService.generateToken(
                            username
                    );

            response.put("success", true);
            response.put("message",
                    "Access token refreshed");

            response.put("token",
                    newAccessToken);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            response.put("success", false);
            response.put("message",
                    "Invalid refresh token");

            return ResponseEntity
                    .status(401)
                    .body(response);
        }
    }

    // =========================
    // FORGOT PASSWORD
    // =========================

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(
            @RequestBody Map<String, String> request) {

        Map<String, Object> response =
                new HashMap<>();

        String username =
                request.get("username");

        if (username == null ||
                username.isBlank()) {

            response.put("success", false);
            response.put("message",
                    "Username is required");

            return ResponseEntity
                    .badRequest()
                    .body(response);
        }

        User user =
                userRepository
                        .findByUsername(username)
                        .orElse(null);

        if (user == null) {

            response.put("success", false);
            response.put("message",
                    "User not found");

            return ResponseEntity
                    .status(404)
                    .body(response);
        }

        // Generate secure reset token
        String resetToken =
                UUID.randomUUID().toString();

        // Token valid for 15 minutes
        LocalDateTime expiryTime =
                LocalDateTime.now()
                        .plusMinutes(15);

        PasswordResetToken passwordResetToken =
                new PasswordResetToken(
                        resetToken,
                        username,
                        expiryTime
                );

        passwordResetTokenRepository
                .save(passwordResetToken);

        response.put("success", true);

        response.put("message",
                "Password reset token generated");

        // Temporary testing response.
        // Later this token should be sent through email.
        response.put("resetToken",
                resetToken);

        return ResponseEntity.ok(response);
    }

    // =========================
    // RESET PASSWORD
    // =========================

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        Map<String, Object> response =
                new HashMap<>();

        if (request.getToken() == null ||
                request.getToken().isBlank()) {

            response.put("success", false);
            response.put("message",
                    "Reset token is required");

            return ResponseEntity
                    .badRequest()
                    .body(response);
        }

        if (request.getNewPassword() == null ||
                request.getNewPassword().isBlank()) {

            response.put("success", false);
            response.put("message",
                    "New password is required");

            return ResponseEntity
                    .badRequest()
                    .body(response);
        }

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(request.getToken())
                        .orElse(null);

        if (resetToken == null) {

            response.put("success", false);
            response.put("message",
                    "Invalid reset token");

            return ResponseEntity
                    .status(400)
                    .body(response);
        }

        // Check whether token was already used
        if (resetToken.isUsed()) {

            response.put("success", false);
            response.put("message",
                    "Reset token has already been used");

            return ResponseEntity
                    .status(400)
                    .body(response);
        }

        // Check token expiry
        if (resetToken.getExpiryTime()
                .isBefore(LocalDateTime.now())) {

            response.put("success", false);
            response.put("message",
                    "Reset token has expired");

            return ResponseEntity
                    .status(400)
                    .body(response);
        }

        User user =
                userRepository
                        .findByUsername(
                                resetToken.getUsername()
                        )
                        .orElse(null);

        if (user == null) {

            response.put("success", false);
            response.put("message",
                    "User not found");

            return ResponseEntity
                    .status(404)
                    .body(response);
        }

        // Encode the new password
        String encodedPassword =
                passwordEncoder.encode(
                        request.getNewPassword()
                );

        user.setPassword(encodedPassword);

        userRepository.save(user);

        // Mark reset token as used
        resetToken.setUsed(true);

        passwordResetTokenRepository
                .save(resetToken);

        response.put("success", true);
        response.put("message",
                "Password reset successful");

        return ResponseEntity.ok(response);
    }
}