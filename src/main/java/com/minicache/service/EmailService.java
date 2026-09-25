package com.minicache.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(
            String toEmail,
            String resetLink) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);

        message.setSubject(
                "MiniCache - Password Reset"
        );

        message.setText(
                "Hello,\n\n" +
                        "We received a request to reset your MiniCache password.\n\n" +
                        "Click the link below to reset your password:\n\n" +
                        resetLink +
                        "\n\n" +
                        "This link will expire in 15 minutes.\n\n" +
                        "If you did not request a password reset, " +
                        "you can safely ignore this email.\n\n" +
                        "Regards,\n" +
                        "MiniCache Team"
        );

        mailSender.send(message);
    }
}