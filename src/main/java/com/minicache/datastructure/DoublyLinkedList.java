package com.minicache.datastructure;

import com.minicache.model.CacheNode;

public class DoublyLinkedList<K, V> {

    private CacheNode<K, V> head;
    private CacheNode<K, V> tail;

    public void addToFront(CacheNode<K, V> node) {

        node.prev = null;
        node.next = head;

        if (head != null) {
            head.prev = node;
        }

        head = node;

        if (tail == null) {
            tail = node;
        }
    }

    public void removeNode(CacheNode<K, V> node) {

        if (node.prev != null) {
            node.prev.next = node.next;
        } else {
            head = node.next;
        }

        if (node.next != null) {
            node.next.prev = node.prev;
        } else {
            tail = node.prev;
        }

        node.prev = null;
        node.next = null;
    }

    public void moveToFront(CacheNode<K, V> node) {

        removeNode(node);
        addToFront(node);
    }

    public CacheNode<K, V> removeLast() {

        if (tail == null) {
            return null;
        }

        CacheNode<K, V> lastNode = tail;

        removeNode(lastNode);

        return lastNode;
    }

    public void clear() {
        head = null;
        tail = null;
    }
}