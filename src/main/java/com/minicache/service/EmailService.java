package com.minicache.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Value("${EMAILJS_SERVICE_ID}")
    private String serviceId;

    @Value("${EMAILJS_TEMPLATE_ID}")
    private String templateId;

    @Value("${EMAILJS_PUBLIC_KEY}")
    private String publicKey;

    @Value("${EMAILJS_PRIVATE_KEY}")
    private String privateKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEmail(
            String email,
            String name,
            String emailTitle,
            String message,
            String actionLink,
            String actionText,
            int expiryMinutes) {

        String url =
                "https://api.emailjs.com/api/v1.0/email/send";

        Map<String, Object> templateParams =
                new HashMap<>();

        templateParams.put("name", name);
        templateParams.put("email", email);
        templateParams.put("email_title", emailTitle);
        templateParams.put("message", message);
        templateParams.put("action_link", actionLink);
        templateParams.put("action_text", actionText);
        templateParams.put(
                "expiry_minutes",
                String.valueOf(expiryMinutes)
        );

        Map<String, Object> requestBody =
                new HashMap<>();

        requestBody.put(
                "service_id",
                serviceId
        );

        requestBody.put(
                "template_id",
                templateId
        );

        requestBody.put(
                "user_id",
                publicKey
        );

        requestBody.put(
                "accessToken",
                privateKey
        );

        requestBody.put(
                "template_params",
                templateParams
        );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(
                        requestBody,
                        headers
                );

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        url,
                        request,
                        String.class
                );

        if (!response.getStatusCode().is2xxSuccessful()) {

            throw new RuntimeException(
                    "Failed to send email: "
                            + response.getBody()
            );
        }
    }
}