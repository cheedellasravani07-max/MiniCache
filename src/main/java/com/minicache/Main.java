package com.minicache;

import com.minicache.cache.MiniCache;

public class Main {

    public static void main(String[] args) {

        System.out.println("=================================");
        System.out.println("        MiniCache Demo");
        System.out.println("=================================");

        // Create cache with capacity 3
        MiniCache<String, String> cache = new MiniCache<>(3);

        // -------------------------------
        // 1. SET AND GET
        // -------------------------------

        System.out.println("\n1. SET AND GET");

        cache.set("name", "Sravani");
        cache.set("city", "Bhimavaram");
        cache.set("course", "B.Tech IT");

        System.out.println("Name   : " + cache.get("name"));
        System.out.println("City   : " + cache.get("city"));
        System.out.println("Course : " + cache.get("course"));


        // -------------------------------
        // 2. UPDATE VALUE
        // -------------------------------

        System.out.println("\n2. UPDATE VALUE");

        cache.set("name", "Sravani Cheedella");

        System.out.println("Updated Name : " + cache.get("name"));


        // -------------------------------
        // 3. LRU EVICTION
        // -------------------------------

        System.out.println("\n3. LRU EVICTION");

        MiniCache<String, String> lruCache =
                new MiniCache<>(2);

        lruCache.set("A", "Apple");
        lruCache.set("B", "Banana");

        // Access A
        lruCache.get("A");

        // C will remove B
        lruCache.set("C", "Cherry");

        System.out.println("A : " + lruCache.get("A"));
        System.out.println("B : " + lruCache.get("B"));
        System.out.println("C : " + lruCache.get("C"));


        // -------------------------------
        // 4. TTL EXPIRATION
        // -------------------------------

        System.out.println("\n4. TTL EXPIRATION");

        MiniCache<String, String> ttlCache =
                new MiniCache<>(3);

        ttlCache.set("session", "Active", 2000);

        System.out.println(
                "Immediately : " + ttlCache.get("session")
        );

        try {
            Thread.sleep(2500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println(
                "After 2.5 seconds : " + ttlCache.get("session")
        );


        // -------------------------------
        // 5. DELETE
        // -------------------------------

        System.out.println("\n5. DELETE");

        cache.set("temp", "Temporary Data");

        boolean deleted = cache.delete("temp");

        System.out.println("Deleted : " + deleted);
        System.out.println("Value   : " + cache.get("temp"));


        // -------------------------------
        // 6. CACHE STATISTICS
        // -------------------------------

        System.out.println("\n6. CACHE STATISTICS");

        MiniCache<String, String> statsCache =
                new MiniCache<>(3);

        statsCache.set("name", "Sravani");

        // Hit
        statsCache.get("name");

        // Miss
        statsCache.get("unknown");

        System.out.println(
                "Cache Hits   : " + statsCache.getCacheHits()
        );

        System.out.println(
                "Cache Misses : " + statsCache.getCacheMisses()
        );

        System.out.println(
                "Hit Rate     : " + statsCache.getHitRate() + "%"
        );


        System.out.println("\n=================================");
        System.out.println("       MiniCache Demo Finished");
        System.out.println("=================================");
    }
}