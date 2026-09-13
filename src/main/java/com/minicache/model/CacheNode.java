package com.minicache.model;

public class CacheNode<K, V> {

    public K key;
    public V value;

    public long expiryTime;

    public CacheNode<K, V> prev;
    public CacheNode<K, V> next;

    public CacheNode(K key, V value, long expiryTime) {
        this.key = key;
        this.value = value;
        this.expiryTime = expiryTime;
    }
}