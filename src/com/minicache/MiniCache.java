package com.minicache;

import java.util.HashMap;

public class MiniCache {

    private HashMap<String, CacheEntry> cache;

    public MiniCache() {
        cache = new HashMap<>();
    }

    // SET
    public void set(String key, String value) {
        cache.put(key, new CacheEntry(value));
    }

    // GET
    public String get(String key) {

        CacheEntry entry = cache.get(key);

        if (entry == null) {
            return null;
        }

        return entry.getValue();
    }

    // DELETE
    public boolean delete(String key) {

        if (cache.containsKey(key)) {
            cache.remove(key);
            return true;
        }

        return false;
    }

    // SIZE
    public int size() {
        return cache.size();
    }

    // CLEAR
    public void clear() {
        cache.clear();
    }
}