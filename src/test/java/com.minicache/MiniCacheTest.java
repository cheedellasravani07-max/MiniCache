package com.minicache;

import com.minicache.cache.MiniCache;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNull;
public class MiniCacheTest {

    @Test
    void testSetAndGet() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        cache.set("name", "Sravani");

        assertEquals("Sravani", cache.get("name"));
    }

    @Test
    void testOverwriteValue() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        cache.set("name", "Sravani");
        cache.set("name", "Sravani Cheedella");

        assertEquals("Sravani Cheedella", cache.get("name"));
    }

    @Test
    void testLRUEviction() {
        MiniCache<String, String> cache = new MiniCache<>(2);

        cache.set("A", "Apple");
        cache.set("B", "Banana");

        cache.get("A");

        cache.set("C", "Cherry");

        assertEquals("Apple", cache.get("A"));
        assertEquals(null, cache.get("B"));
        assertEquals("Cherry", cache.get("C"));
    }

    @Test
    void testTTLExpiration() throws InterruptedException {
        MiniCache<String, String> cache = new MiniCache<>(3);

        cache.set("session", "active", 1000);

        assertEquals("active", cache.get("session"));

        Thread.sleep(1100);

        assertEquals(null, cache.get("session"));
    }

    @Test
    void testDelete() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        cache.set("name", "Sravani");

        boolean deleted = cache.delete("name");

        assertEquals(true, deleted);
        assertEquals(null, cache.get("name"));
    }

    @Test
    void testClear() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        cache.set("name", "Sravani");
        cache.set("city", "Bhimavaram");
        cache.set("course", "B.Tech");

        cache.clear();

        assertEquals(null, cache.get("name"));
        assertEquals(null, cache.get("city"));
        assertEquals(null, cache.get("course"));
    }

    @Test
    void testCacheStatistics() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        cache.set("name", "Sravani");

        cache.get("name");
        cache.get("city");

        assertEquals(1, cache.getCacheHits());
        assertEquals(1, cache.getCacheMisses());
        assertEquals(50.0, cache.getHitRate());
    }

    @Test
    void testInvalidCapacity() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> new MiniCache<String, String>(0)
        );

        assertEquals(
                "Cache capacity must be greater than 0",
                exception.getMessage()
        );
    }

    @Test
    void testNullKey() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> cache.set(null, "value")
        );

        assertEquals("Key cannot be null", exception.getMessage());
    }

    @Test
    void testNullValue() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> cache.set("name", null)
        );

        assertEquals("Value cannot be null", exception.getMessage());
    }

    @Test
    void testInvalidTTL() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> cache.set("session", "active", 0)
        );

        assertEquals(
                "TTL must be greater than 0",
                exception.getMessage()
        );
    }

    @Test
    void testGetWithNullKey() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> cache.get(null)
        );

        assertEquals("Key cannot be null", exception.getMessage());
    }

    @Test
    void testDeleteWithNullKey() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> cache.delete(null)
        );

        assertEquals("Key cannot be null", exception.getMessage());
    }

    @Test
    void testDeleteNonExistingKey() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        boolean deleted = cache.delete("unknown");

        assertEquals(false, deleted);
    }

    @Test
    void testClearEmptyCache() {
        MiniCache<String, String> cache = new MiniCache<>(3);

        cache.clear();

        assertEquals(null, cache.get("unknown"));
    }

    @Test
    void testEviction() {
        MiniCache<String, String> cache = new MiniCache<>(2);

        cache.set("A", "Apple");
        cache.set("B", "Ball");
        cache.set("C", "Cat");

        assertEquals(null, cache.get("A"));
    }

    @Test
    void testExpiration() throws InterruptedException {
        MiniCache<String, String> cache = new MiniCache<>(3);

        cache.set("name", "Sravani", 1000);

        Thread.sleep(1500);

        assertEquals(null, cache.get("name"));
    }

    @Test
    void testUpdateExistingKey() {
        MiniCache<String, String> cache = new MiniCache<>(2);

        cache.set("name", "Sravani");
        cache.set("name", "Updated Sravani");

        assertEquals("Updated Sravani", cache.get("name"));
    }
    @Test
    void testSize() {

        MiniCache<String, String> cache = new MiniCache<>(3);

        assertEquals(0, cache.size());

        cache.set("A", "Apple");
        cache.set("B", "Banana");

        assertEquals(2, cache.size());

        cache.delete("A");

        assertEquals(1, cache.size());
    }

    @Test
    void testCapacity() {

        MiniCache<String, String> cache = new MiniCache<>(5);

        assertEquals(5, cache.getCapacity());
    }
    @Test
    void testLRUEvictionCount() {

        MiniCache<String, String> cache = new MiniCache<>(2);

        cache.set("A", "Apple");
        cache.set("B", "Banana");

        // Cache is full. Adding C should evict A.
        cache.set("C", "Cherry");

        assertEquals(2, cache.size());
        assertEquals(1, cache.getEvictionCount());

        assertNull(cache.get("A"));
        assertEquals("Banana", cache.get("B"));
        assertEquals("Cherry", cache.get("C"));
    }
}