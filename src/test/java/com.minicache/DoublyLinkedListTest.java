package com.minicache;

import com.minicache.datastructure.DoublyLinkedList;
import com.minicache.model.CacheNode;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class DoublyLinkedListTest {

    @Test
    void testAddToFront() {

        DoublyLinkedList<String, String> list = new DoublyLinkedList<>();

        CacheNode<String, String> node1 =
                new CacheNode<>("A", "Apple", 0);

        CacheNode<String, String> node2 =
                new CacheNode<>("B", "Banana", 0);

        list.addToFront(node1);
        list.addToFront(node2);

        CacheNode<String, String> removed = list.removeLast();

        assertEquals("A", removed.key);
        assertEquals("Apple", removed.value);
    }

    @Test
    void testRemoveNode() {

        DoublyLinkedList<String, String> list = new DoublyLinkedList<>();

        CacheNode<String, String> node1 =
                new CacheNode<>("A", "Apple", 0);

        CacheNode<String, String> node2 =
                new CacheNode<>("B", "Banana", 0);

        CacheNode<String, String> node3 =
                new CacheNode<>("C", "Cherry", 0);

        list.addToFront(node1);
        list.addToFront(node2);
        list.addToFront(node3);

        list.removeNode(node2);

        CacheNode<String, String> removed = list.removeLast();

        assertEquals("A", removed.key);
        assertEquals("Apple", removed.value);

        removed = list.removeLast();

        assertEquals("C", removed.key);
        assertEquals("Cherry", removed.value);
    }

    @Test
    void testMoveToFront() {

        DoublyLinkedList<String, String> list = new DoublyLinkedList<>();

        CacheNode<String, String> nodeA =
                new CacheNode<>("A", "Apple", 0);

        CacheNode<String, String> nodeB =
                new CacheNode<>("B", "Banana", 0);

        CacheNode<String, String> nodeC =
                new CacheNode<>("C", "Cherry", 0);

        list.addToFront(nodeA);
        list.addToFront(nodeB);
        list.addToFront(nodeC);

        list.moveToFront(nodeA);

        CacheNode<String, String> removed = list.removeLast();

        assertEquals("B", removed.key);
        assertEquals("Banana", removed.value);
    }

    @Test
    void testRemoveLast() {

        DoublyLinkedList<String, String> list = new DoublyLinkedList<>();

        CacheNode<String, String> nodeA =
                new CacheNode<>("A", "Apple", 0);

        CacheNode<String, String> nodeB =
                new CacheNode<>("B", "Banana", 0);

        list.addToFront(nodeA);
        list.addToFront(nodeB);

        CacheNode<String, String> removed = list.removeLast();

        assertEquals("A", removed.key);
        assertEquals("Apple", removed.value);

        removed = list.removeLast();

        assertEquals("B", removed.key);
        assertEquals("Banana", removed.value);

        assertNull(list.removeLast());
    }

    @Test
    void testClear() {

        DoublyLinkedList<String, String> list = new DoublyLinkedList<>();

        CacheNode<String, String> nodeA =
                new CacheNode<>("A", "Apple", 0);

        CacheNode<String, String> nodeB =
                new CacheNode<>("B", "Banana", 0);

        list.addToFront(nodeA);
        list.addToFront(nodeB);

        list.clear();

        assertNull(list.removeLast());
    }

    @Test
    void testSingleNode() {

        DoublyLinkedList<String, String> list = new DoublyLinkedList<>();

        CacheNode<String, String> node =
                new CacheNode<>("A", "Apple", 0);

        list.addToFront(node);

        CacheNode<String, String> removed = list.removeLast();

        assertEquals("A", removed.key);
        assertEquals("Apple", removed.value);

        assertNull(list.removeLast());
    }

    @Test
    void testRemoveFirstNode() {

        DoublyLinkedList<String, String> list = new DoublyLinkedList<>();

        CacheNode<String, String> nodeA =
                new CacheNode<>("A", "Apple", 0);

        CacheNode<String, String> nodeB =
                new CacheNode<>("B", "Banana", 0);

        CacheNode<String, String> nodeC =
                new CacheNode<>("C", "Cherry", 0);

        list.addToFront(nodeA);
        list.addToFront(nodeB);
        list.addToFront(nodeC);

        list.removeNode(nodeC);

        CacheNode<String, String> removed = list.removeLast();

        assertEquals("A", removed.key);

        removed = list.removeLast();

        assertEquals("B", removed.key);
    }

    @Test
    void testRemoveLastNodeDirectly() {

        DoublyLinkedList<String, String> list = new DoublyLinkedList<>();

        CacheNode<String, String> nodeA =
                new CacheNode<>("A", "Apple", 0);

        CacheNode<String, String> nodeB =
                new CacheNode<>("B", "Banana", 0);

        list.addToFront(nodeA);
        list.addToFront(nodeB);

        list.removeNode(nodeA);

        CacheNode<String, String> removed = list.removeLast();

        assertEquals("B", removed.key);
        assertEquals("Banana", removed.value);
    }
}