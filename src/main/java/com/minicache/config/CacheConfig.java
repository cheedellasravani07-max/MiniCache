package com.minicache.config;

import com.minicache.cache.MiniCache;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CacheConfig {

    @Bean
    public MiniCache<String, String> miniCache() {
        return new MiniCache<>(100);
    }
}