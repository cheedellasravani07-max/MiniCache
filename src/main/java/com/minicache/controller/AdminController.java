package com.minicache.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/admin")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @GetMapping("/test")
    public ResponseEntity<?> adminTest() {

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Admin authorization successful"
                )
        );
    }
}