package com.minicache.cache;

import com.minicache.datastructure.DoublyLinkedList;
import com.minicache.model.CacheNode;

import java.util.HashMap;
import java.util.Map;

public class MiniCache<K, V> {

    private final int capacity;
    private final Map<K, CacheNode<K, V>> cache;
    private final DoublyLinkedList<K, V> list;

    private int cacheHits;
    private int cacheMisses;

    public MiniCache(int capacity) {

        if (capacity <= 0) {
            throw new IllegalArgumentException(
                    "Cache capacity must be greater than 0"
            );
        }

        this.capacity = capacity;
        this.cache = new HashMap<>();
        this.list = new DoublyLinkedList<>();
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }

    // Normal set - NO TTL
    public synchronized void set(K key, V value) {

        validateKey(key);
        validateValue(value);

        // 0 means no expiration
        setInternal(key, value, 0);
    }

    // Set with TTL
    public synchronized void set(K key, V value, long ttlMillis) {

        validateKey(key);
        validateValue(value);

        if (ttlMillis <= 0) {
            throw new IllegalArgumentException(
                    "TTL must be greater than 0"
            );
        }

        long expiryTime =
                System.currentTimeMillis() + ttlMillis;

        setInternal(key, value, expiryTime);
    }

    // Internal method used by both set methods
    private void setInternal(
            K key,
            V value,
            long expiryTime) {

        CacheNode<K, V> existingNode = cache.get(key);

        // Update existing key
        if (existingNode != null) {

            existingNode.value = value;
            existingNode.expiryTime = expiryTime;

            list.moveToFront(existingNode);

            return;
        }

        // Create new node
        CacheNode<K, V> newNode =
                new CacheNode<>(key, value, expiryTime);

        cache.put(key, newNode);

        list.addToFront(newNode);

        // LRU eviction
        if (cache.size() > capacity) {

            CacheNode<K, V> removedNode =
                    list.removeLast();

            if (removedNode != null) {
                cache.remove(removedNode.key);
            }
        }
    }

    // Get value
    public synchronized V get(K key) {

        validateKey(key);

        CacheNode<K, V> node = cache.get(key);

        // Key does not exist
        if (node == null) {

            cacheMisses++;

            return null;
        }

        // Check expiration
        if (node.expiryTime > 0 &&
                System.currentTimeMillis() >= node.expiryTime) {

            cache.remove(key);
            list.removeNode(node);

            cacheMisses++;

            return null;
        }

        // Cache hit
        cacheHits++;

        // Recently used -> move to front
        list.moveToFront(node);

        return node.value;
    }

    // Delete a key
    public synchronized boolean delete(K key) {

        validateKey(key);

        CacheNode<K, V> node = cache.remove(key);

        if (node == null) {
            return false;
        }

        list.removeNode(node);

        return true;
    }

    // Clear entire cache
    public synchronized void clear() {

        cache.clear();
        list.clear();

        cacheHits = 0;
        cacheMisses = 0;
    }

    // Get number of cache hits
    public synchronized int getCacheHits() {
        return cacheHits;
    }

    // Get number of cache misses
    public synchronized int getCacheMisses() {
        return cacheMisses;
    }

    // Calculate hit rate
    public synchronized double getHitRate() {

        int totalRequests =
                cacheHits + cacheMisses;

        if (totalRequests == 0) {
            return 0.0;
        }

        return (cacheHits * 100.0) / totalRequests;
    }

    // Get current number of entries in cache
    public synchronized int size() {
        return cache.size();
    }

    // Get maximum cache capacity
    public synchronized int getCapacity() {
        return capacity;
    }

    // Validate key
    private void validateKey(K key) {

        if (key == null) {
            throw new IllegalArgumentException(
                    "Key cannot be null"
            );
        }
    }

    // Validate value
    private void validateValue(V value) {

        if (value == null) {
            throw new IllegalArgumentException(
                    "Value cannot be null"
            );
        }
    }
    // Get all current cache entries
    public synchronized Map<K, V> getEntries() {

        Map<K, V> entries = new HashMap<>();

        for (Map.Entry<K, CacheNode<K, V>> entry : cache.entrySet()) {

            CacheNode<K, V> node = entry.getValue();

            if (node.expiryTime == 0 ||
                    System.currentTimeMillis() < node.expiryTime) {

                entries.put(node.key, node.value);
            }
        }

        return entries;
    }
}