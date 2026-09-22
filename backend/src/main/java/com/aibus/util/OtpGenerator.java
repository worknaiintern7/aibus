package com.aibus.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OtpGenerator {

    private final SecureRandom random = new SecureRandom();

    public String generateSixDigitOtp() {
        int number = random.nextInt(1000000);
        return String.format("%06d", number);
    }
}
