package com.minicache.controller;

import com.minicache.model.User;
import com.minicache.repository.UserRepository;
import com.minicache.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserRepository userRepository) {

        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
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

        String token =
                jwtService.generateToken(
                        existingUser.getUsername()
                );

        response.put("success", true);
        response.put("message",
                "Login successful");
        response.put("username",
                existingUser.getUsername());
        response.put("token", token);

        return ResponseEntity.ok(response);
    }
}