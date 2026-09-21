package com.minicache.controller;

import com.minicache.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.minicache.security.JwtService;
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;

    }
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody User user) {

        Map<String, Object> response =
                new HashMap<>();

        if ("admin".equals(user.getUsername())
                && passwordEncoder.matches(
                user.getPassword(),
                passwordEncoder.encode("admin123"))) {

            String token =
                    jwtService.generateToken(user.getUsername());

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("username", user.getUsername());
            response.put("token", token);
            return ResponseEntity.ok(response);
        }

        response.put("success", false);
        response.put("message", "Invalid username or password");

        return ResponseEntity
                .status(401)
                .body(response);
    }
}