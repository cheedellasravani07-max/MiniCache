package com.minicache;

import com.minicache.cache.MiniCache;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ThreadSafetyTest {

    @Test
    void testMultipleThreads() throws InterruptedException {

        MiniCache<Integer, String> cache =
                new MiniCache<>(100);

        int numberOfThreads = 10;

        Thread[] threads = new Thread[numberOfThreads];

        for (int i = 0; i < numberOfThreads; i++) {

            final int threadNumber = i;

            threads[i] = new Thread(() -> {

                for (int j = 0; j < 10; j++) {

                    int key = threadNumber * 10 + j;

                    cache.set(key, "Value-" + key);

                    assertNotNull(cache.get(key));
                }
            });
        }

        // Start all threads
        for (Thread thread : threads) {
            thread.start();
        }

        // Wait for all threads
        for (Thread thread : threads) {
            thread.join();
        }

        // Cache should contain 100 entries
        assertEquals(100, cache.size());
    }
}