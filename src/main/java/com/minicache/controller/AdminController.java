package com.minicache.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.minicache.model.Role;
import java.util.Map;
import com.minicache.model.User;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.minicache.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
@RestController
@RequestMapping("/admin")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {
    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/test")
    public ResponseEntity<?> adminTest() {

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Admin authorization successful"
                )
        );
    }
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {

        return ResponseEntity.ok(
                userRepository.findAll()
        );
    }
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(
            @PathVariable Long id,
            @RequestParam Role role) {

        User user = userRepository.findById(id)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        if (user.getUsername().equals(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    "Admin cannot change their own role"
                            )
                    );
        }

        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "User role updated successfully",
                        "username",
                        user.getUsername(),
                        "role",
                        user.getRole().name()
                )
        );
    }

}