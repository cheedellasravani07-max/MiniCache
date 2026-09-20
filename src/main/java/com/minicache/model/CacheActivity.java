package com.minicache.model;

public class CacheActivity {

    private String time;
    private String operation;
    private String key;
    private String status;

    public CacheActivity(String time, String operation, String key, String status) {
        this.time = time;
        this.operation = operation;
        this.key = key;
        this.status = status;
    }

    public String getTime() {
        return time;
    }

    public String getOperation() {
        return operation;
    }

    public String getKey() {
        return key;
    }

    public String getStatus() {
        return status;
    }
}