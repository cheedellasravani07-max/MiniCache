package com.minicache.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
@Service
public class JwtService {

    @Value("${JWT_SECRET}")
    private String secret;
    // Access token = 15 minutes
    private static final long ACCESS_TOKEN_EXPIRATION =
            1000L * 60 * 15;

    // Refresh token = 7 days
    private static final long REFRESH_TOKEN_EXPIRATION =
            1000L * 60 * 60 * 24 * 7;

    private SecretKey getSecretKey() {

        return Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    // =========================
    // ACCESS TOKEN
    // =========================

    public String generateToken(String username) {

        return generateToken(
                username,
                ACCESS_TOKEN_EXPIRATION
        );
    }

    // =========================
    // REFRESH TOKEN
    // =========================

    public String generateRefreshToken(String username) {

        return generateToken(
                username,
                REFRESH_TOKEN_EXPIRATION
        );
    }

    // =========================
    // GENERATE TOKEN
    // =========================

    private String generateToken(
            String username,
            long expirationTime) {

        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime() + expirationTime
                );

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(getSecretKey())
                .compact();
    }

    // =========================
    // EXTRACT USERNAME
    // =========================

    public String extractUsername(String token) {

        return getClaims(token)
                .getSubject();
    }

    // =========================
    // VALIDATE TOKEN
    // =========================

    public boolean isTokenValid(String token) {

        try {

            Claims claims =
                    getClaims(token);

            return claims.getExpiration()
                    .after(new Date());

        } catch (Exception e) {

            return false;
        }
    }

    // =========================
    // GET CLAIMS
    // =========================

    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}