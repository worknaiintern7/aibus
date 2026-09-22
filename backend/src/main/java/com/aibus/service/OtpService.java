package com.aibus.service;

import com.aibus.entity.Otp;
import com.aibus.repository.OtpRepository;
import com.aibus.util.OtpGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    private final OtpGenerator otpGenerator;

    public OtpService(OtpRepository otpRepository, OtpGenerator otpGenerator) {
        this.otpRepository = otpRepository;
        this.otpGenerator = otpGenerator;
    }

    @Transactional
    public Otp generateAndSaveOtp(String mobile) {
        // Invalidate/delete existing OTPs for this mobile to ensure only latest OTP remains valid
        otpRepository.deleteByMobile(mobile);

        String otpCode = otpGenerator.generateSixDigitOtp();

        Otp otp = new Otp();
        otp.setMobile(mobile);
        otp.setOtp(otpCode);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setUsed(false);

        return otpRepository.save(otp);
    }

    @Transactional
    public boolean verifyOtp(String mobile, String otpCode) {
        Optional<Otp> otpOptional = otpRepository.findTopByMobileOrderByIdDesc(mobile);

        if (otpOptional.isEmpty()) {
            return false;
        }

        Otp otp = otpOptional.get();

        if (otp.isUsed()) {
            return false;
        }

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        if (!otp.getOtp().equals(otpCode)) {
            return false;
        }

        // Mark OTP as used (single-use enforcement)
        otp.setUsed(true);
        otpRepository.save(otp);

        return true;
    }
}
