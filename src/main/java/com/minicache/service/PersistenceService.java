package com.minicache.service;

import com.minicache.cache.MiniCache;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class PersistenceService {

    private static final String DATA_DIRECTORY = "data";
    private static final String AOF_FILE = "data/cache.aof";

    private final MiniCache<String, String> cache;

    public PersistenceService(
            MiniCache<String, String> cache) {

        this.cache = cache;
    }

    public synchronized void saveSet(
            String key,
            String value) {

        createDataDirectory();

        try (BufferedWriter writer =
                     new BufferedWriter(
                             new FileWriter(AOF_FILE, true))) {

            writer.write(
                    "SET|" +
                            encode(key) +
                            "|" +
                            encode(value)
            );

            writer.newLine();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save cache data",
                    e
            );
        }
    }
    public synchronized void saveSet(
            String key,
            String value,
            long ttlMillis) {

        createDataDirectory();

        long expiryTime =
                System.currentTimeMillis() + ttlMillis;

        try (BufferedWriter writer =
                     new BufferedWriter(
                             new FileWriter(AOF_FILE, true))) {

            writer.write(
                    "SET_TTL|" +
                            encode(key) +
                            "|" +
                            encode(value) +
                            "|" +
                            expiryTime
            );

            writer.newLine();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save cache data",
                    e
            );
        }
    }
    public synchronized void saveDelete(
            String key) {

        createDataDirectory();

        try (BufferedWriter writer =
                     new BufferedWriter(
                             new FileWriter(AOF_FILE, true))) {

            writer.write(
                    "DELETE|" +
                            encode(key)
            );

            writer.newLine();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save delete operation",
                    e
            );
        }
    }

    public synchronized void saveClear() {

        createDataDirectory();

        try (BufferedWriter writer =
                     new BufferedWriter(
                             new FileWriter(AOF_FILE, true))) {

            writer.write("CLEAR");
            writer.newLine();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save clear operation",
                    e
            );
        }
    }

    private void createDataDirectory() {

        try {

            Path directory =
                    Paths.get(DATA_DIRECTORY);

            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to create data directory",
                    e
            );
        }
    }

    private String encode(String value) {

        return java.util.Base64
                .getEncoder()
                .encodeToString(
                        value.getBytes(
                                java.nio.charset.StandardCharsets.UTF_8
                        )
                );
    }
    @PostConstruct
    public synchronized void loadFromFile() {

        Path file = Paths.get(AOF_FILE);

        if (!Files.exists(file)) {
            return;
        }

        try (BufferedReader reader =
                     Files.newBufferedReader(file)) {

            String line;

            while ((line = reader.readLine()) != null) {

                if (line.equals("CLEAR")) {

                    cache.clear();
                    continue;
                }

                if (line.startsWith("DELETE|")) {

                    String encodedKey =
                            line.substring(7);

                    String key = decode(encodedKey);


                    continue;
                }
                if (line.startsWith("SET_TTL|")) {

                    String[] parts =
                            line.split("\\|", 4);

                    if (parts.length == 4) {

                        String key =
                                decode(parts[1]);

                        String value =
                                decode(parts[2]);

                        long expiryTime =
                                Long.parseLong(parts[3]);

                        long remainingTTL =
                                expiryTime -
                                        System.currentTimeMillis();

                        if (remainingTTL > 0) {

                            cache.set(
                                    key,
                                    value,
                                    remainingTTL
                            );
                        }
                    }
                }
               else if (line.startsWith("SET|")) {

                    String[] parts =
                            line.split("\\|", 3);

                    if (parts.length == 3) {

                        String key =
                                decode(parts[1]);

                        String value =
                                decode(parts[2]);

                        cache.set(key, value);
                    }
                }
            }

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to load cache data",
                    e
            );
        }
    }

    private String decode(String value) {

        return new String(
                java.util.Base64
                        .getDecoder()
                        .decode(value),
                java.nio.charset.StandardCharsets.UTF_8
        );
    }
}