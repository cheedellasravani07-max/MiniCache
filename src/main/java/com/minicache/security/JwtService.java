package com.minicache.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET =
            "MiniCacheAuthenticationSecretKey2026ForJWT123456";

    // Access token: 1 hour
    private static final long ACCESS_TOKEN_EXPIRATION =
            1000 * 60 * 60;

    // Refresh token: 7 days
    private static final long REFRESH_TOKEN_EXPIRATION =
            1000L * 60 * 60 * 24 * 7;

    private final SecretKey secretKey =
            Keys.hmacShaKeyFor(
                    SECRET.getBytes(StandardCharsets.UTF_8)
            );

    // ==========================================
    // Generate Access Token
    // ==========================================

    public String generateToken(String username) {

        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime()
                                + ACCESS_TOKEN_EXPIRATION
                );

        return Jwts.builder()
                .subject(username)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    // ==========================================
    // Generate Refresh Token
    // ==========================================

    public String generateRefreshToken(String username) {

        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime()
                                + REFRESH_TOKEN_EXPIRATION
                );

        return Jwts.builder()
                .subject(username)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    // ==========================================
    // Extract Username
    // ==========================================

    public String extractUsername(String token) {

        return getClaims(token)
                .getSubject();
    }

    // ==========================================
    // Validate Access Token
    // ==========================================

    public boolean isTokenValid(String token) {

        try {

            Claims claims = getClaims(token);

            String type =
                    claims.get("type", String.class);

            return "access".equals(type)
                    && claims.getExpiration()
                    .after(new Date());

        } catch (Exception e) {

            return false;
        }
    }

    // ==========================================
    // Validate Refresh Token
    // ==========================================

    public boolean isRefreshTokenValid(String token) {

        try {

            Claims claims = getClaims(token);

            String type =
                    claims.get("type", String.class);

            return "refresh".equals(type)
                    && claims.getExpiration()
                    .after(new Date());

        } catch (Exception e) {

            return false;
        }
    }

    // ==========================================
    // Get JWT Claims
    // ==========================================

    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}