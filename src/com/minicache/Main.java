package com.minicache;

public class Main {

    public static void main(String[] args) {

        MiniCache cache = new MiniCache();

        // SET
        cache.set("name", "Sravani");
        cache.set("branch", "IT");
        cache.set("college", "SVECW");

        // GET
        System.out.println("Name: " + cache.get("name"));
        System.out.println("Branch: " + cache.get("branch"));

        // SIZE
        System.out.println("Cache Size: " + cache.size());

        // DELETE
        boolean deleted = cache.delete("college");

        System.out.println("College deleted: " + deleted);

        // SIZE after delete
        System.out.println("Cache Size: " + cache.size());

        // CLEAR
        cache.clear();

        System.out.println("Cache Size after clear: " + cache.size());
    }
}