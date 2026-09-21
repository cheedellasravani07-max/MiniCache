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
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
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
            addActivity(
                    "SET",
                    key,
                    "TTL: " + ttl + " ms"
            );
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


    @GetMapping("/key/{key}")
    public ResponseEntity<String> get(
            @PathVariable String key) {

        // Check if the key expired before calling get()
        boolean expired = cache.isExpired(key);

        String value = cache.get(key);

        if (value == null) {

            if (expired) {

                addActivity(
                        "GET",
                        key,
                        "EXPIRED"
                );

            } else {

                addActivity(
                        "GET",
                        key,
                        "MISS"
                );
            }

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
    @GetMapping("/lru")
    public ResponseEntity<List<String>> getLRUOrder() {

        return ResponseEntity.ok(
                cache.getLRUOrder()
        );
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {

        Map<String, Object> health = new HashMap<>();

        health.put("status", "UP");
        health.put("cacheSize", cache.size());
        health.put("capacity", cache.getCapacity());
        health.put("hits", cache.getCacheHits());
        health.put("misses", cache.getCacheMisses());

        return ResponseEntity.ok(health);
    }
    @PostMapping("/bulk")
    public ResponseEntity<String> bulkSet(
            @RequestBody Map<String, String> entries) {

        if (entries == null || entries.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("No entries provided");
        }

        for (Map.Entry<String, String> entry : entries.entrySet()) {

            cache.set(
                    entry.getKey(),
                    entry.getValue()
            );

            addActivity(
                    "BULK SET",
                    entry.getKey(),
                    "Success"
            );
        }

        return ResponseEntity.ok(
                entries.size() + " entries added successfully"
        );
    }
    @GetMapping("/benchmark/concurrency")
    public ResponseEntity<Map<String, Object>> concurrencyBenchmark(
            @RequestParam(defaultValue = "100") int requests) {

        if (requests <= 0) {

            Map<String, Object> error = new HashMap<>();

            error.put(
                    "error",
                    "Requests must be greater than 0"
            );

            return ResponseEntity.badRequest().body(error);
        }

        ExecutorService executor =
                Executors.newFixedThreadPool(
                        Math.min(requests, 100)
                );

        CountDownLatch startLatch =
                new CountDownLatch(1);

        CountDownLatch doneLatch =
                new CountDownLatch(requests);

        long startTime =
                System.nanoTime();

        for (int i = 0; i < requests; i++) {

            executor.submit(() -> {

                try {

                    startLatch.await();

                    cache.get("benchmark-key");

                } catch (InterruptedException e) {

                    Thread.currentThread().interrupt();

                } finally {

                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();

        try {

            doneLatch.await();

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            executor.shutdownNow();

            Map<String, Object> error =
                    new HashMap<>();

            error.put(
                    "error",
                    "Benchmark interrupted"
            );

            return ResponseEntity.internalServerError()
                    .body(error);
        }

        long endTime =
                System.nanoTime();

        executor.shutdown();

        double durationMs =
                (endTime - startTime) / 1_000_000.0;

        double requestsPerSecond =
                durationMs == 0
                        ? 0
                        : requests / (durationMs / 1000.0);

        Map<String, Object> result =
                new HashMap<>();

        result.put("requests", requests);
        result.put("durationMs",
                Math.round(durationMs * 100.0) / 100.0);
        result.put("requestsPerSecond",
                Math.round(requestsPerSecond * 100.0) / 100.0);

        return ResponseEntity.ok(result);
    }
}