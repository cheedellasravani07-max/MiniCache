package com.minicache.controller;

import com.minicache.cache.MiniCache;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import com.minicache.model.CacheActivity;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
@RestController
@RequestMapping("/cache")
@CrossOrigin(origins = "*")
public class CacheController {

    private final MiniCache<String, String> cache;
    private final LinkedList<CacheActivity> activityLog =
            new LinkedList<>();

    private static final int MAX_ACTIVITY = 20;

    private final DateTimeFormatter timeFormatter =
            DateTimeFormatter.ofPattern("h:mm:ss a");
    public CacheController() {
        cache = new MiniCache<>(100);
    }

    // Set or update cache value
    @PostMapping("/key/{key}")
    public ResponseEntity<String> set(
            @PathVariable String key,
            @RequestBody Map<String, Object> request) {

        Object valueObject = request.get("value");

        if (valueObject == null) {
            return ResponseEntity.badRequest()
                    .body("Value cannot be null");
        }

        String value = valueObject.toString();

        Object ttlObject = request.get("ttl");

        if (ttlObject != null) {
            long ttl = Long.parseLong(ttlObject.toString());

            cache.set(key, value, ttl);
        } else {
            cache.set(key, value);
        }
        addActivity(
                "SET",
                key,
                "Success"
        );
        return ResponseEntity.ok(
                "Cache updated successfully"
        );
    }

    // Get cache value
    @GetMapping("/key/{key}")
    public ResponseEntity<String> get(
            @PathVariable String key) {

        String value = cache.get(key);

        if (value == null) {
            addActivity(
                    "GET",
                    key,
                    "MISS"
            );
            return ResponseEntity.notFound().build();
        }

        addActivity(
                "GET",
                key,
                "HIT"
        );
        return ResponseEntity.ok(value);
    }

    // Delete a key
    @DeleteMapping("/key/{key}")
    public ResponseEntity<String> delete(
            @PathVariable String key) {

        boolean deleted = cache.delete(key);

        if (!deleted) {
            addActivity(
                    "DELETE",
                    key,
                    "Not Found"
            );
            return ResponseEntity.notFound().build();
        }
        addActivity(
                "DELETE",
                key,
                "Success"
        );
        return ResponseEntity.ok(
                "Key deleted successfully"
        );
    }

    // Clear entire cache
    @DeleteMapping
    public ResponseEntity<String> clear() {

        cache.clear();

        return ResponseEntity.ok(
                "Cache cleared successfully"
        );
    }

    // Cache statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {

        Map<String, Object> statistics =
                new HashMap<>();

        statistics.put("size", cache.size());
        statistics.put("capacity", cache.getCapacity());
        statistics.put("hits", cache.getCacheHits());
        statistics.put("misses", cache.getCacheMisses());
        statistics.put("hitRate", cache.getHitRate());
        statistics.put("evictions", cache.getEvictionCount());
        return ResponseEntity.ok(statistics);
    }
    @GetMapping("/entries")
    public ResponseEntity<Map<String, String>> entries() {

        Map<String, String> entries = cache.getEntries();

        return ResponseEntity.ok(entries);
    }
    private void addActivity(
            String operation,
            String key,
            String status) {

        String time =
                LocalTime.now().format(timeFormatter);

        activityLog.addFirst(
                new CacheActivity(
                        time,
                        operation,
                        key,
                        status
                )
        );

        if (activityLog.size() > MAX_ACTIVITY) {
            activityLog.removeLast();
        }
    }
    @GetMapping("/activity")
    public ResponseEntity<List<CacheActivity>> activity() {

        return ResponseEntity.ok(
                new ArrayList<>(activityLog)
        );
    }
}