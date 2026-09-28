package com.minicache.service;

import com.minicache.model.EmailVerificationToken;
import com.minicache.model.User;
import com.minicache.repository.EmailVerificationTokenRepository;
import com.minicache.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            UserRepository userRepository) {

        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }

    public String createVerificationToken(String username) {

        String token = UUID.randomUUID().toString();

        EmailVerificationToken verificationToken =
                new EmailVerificationToken(
                        token,
                        username,
                        LocalDateTime.now().plusHours(24)
                );

        tokenRepository.save(verificationToken);

        return token;
    }

    public boolean verifyEmail(String token) {

        EmailVerificationToken verificationToken =
                tokenRepository.findByToken(token).orElse(null);

        if (verificationToken == null) {
            return false;
        }

        if (verificationToken.isUsed()) {
            return false;
        }

        if (verificationToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false;
        }

        User user = userRepository
                .findByUsername(verificationToken.getUsername())
                .orElse(null);

        if (user == null) {
            return false;
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);

        return true;
    }
}