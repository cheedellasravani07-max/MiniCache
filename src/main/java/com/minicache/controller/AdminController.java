package com.minicache.controller;
import com.minicache.cache.MiniCache;
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
    private final MiniCache<String, String> cache;
    public AdminController(
            UserRepository userRepository,
            MiniCache<String, String> cache) {

        this.userRepository = userRepository;
        this.cache = cache;
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
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        if (user.getRole() == Role.ADMIN) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    "Admin accounts cannot be deleted"
                            )
                    );
        }

        userRepository.delete(user);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "User deleted successfully",
                        "username",
                        user.getUsername()
                )
        );
    }
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {

        long totalUsers = userRepository.count();

        long totalAdmins = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .count();

        long totalNormalUsers = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.USER)
                .count();

        long verifiedUsers = userRepository.findAll()
                .stream()
                .filter(User::isEmailVerified)
                .count();

        long unverifiedUsers =
                totalUsers - verifiedUsers;
        int cacheSize = cache.size();
        int cacheCapacity = cache.getCapacity();
        int cacheHits = cache.getCacheHits();
        int cacheMisses = cache.getCacheMisses();
        double cacheHitRate = cache.getHitRate();
        int cacheEvictions = cache.getEvictionCount();
        return ResponseEntity.ok(
                Map.ofEntries(
                        Map.entry("totalUsers", totalUsers),
                        Map.entry("totalAdmins", totalAdmins),
                        Map.entry("totalNormalUsers", totalNormalUsers),
                        Map.entry("verifiedUsers", verifiedUsers),
                        Map.entry("unverifiedUsers", unverifiedUsers),
                        Map.entry("cacheSize", cacheSize),
                        Map.entry("cacheCapacity", cacheCapacity),
                        Map.entry("cacheHits", cacheHits),
                        Map.entry("cacheMisses", cacheMisses),
                        Map.entry("cacheHitRate", cacheHitRate),
                        Map.entry("cacheEvictions", cacheEvictions)
                )
        );
    }
}