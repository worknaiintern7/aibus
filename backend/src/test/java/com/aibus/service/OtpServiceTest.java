package com.aibus.service;

import com.aibus.entity.Otp;
import com.aibus.repository.OtpRepository;
import com.aibus.util.OtpGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private OtpGenerator otpGenerator;

    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OtpService(otpRepository, otpGenerator);
    }

    @Test
    void generateAndSaveOtp_ShouldDeleteOldAndSaveNewOtp() {
        String mobile = "9876543210";
        when(otpGenerator.generateSixDigitOtp()).thenReturn("123456");
        when(otpRepository.save(any(Otp.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Otp otp = otpService.generateAndSaveOtp(mobile);

        verify(otpRepository).deleteByMobile(mobile);
        assertNotNull(otp);
        assertEquals(mobile, otp.getMobile());
        assertEquals("123456", otp.getOtp());
        assertFalse(otp.isUsed());
        assertTrue(otp.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Test
    void verifyOtp_ValidOtp_ShouldReturnTrueAndMarkAsUsed() {
        String mobile = "9876543210";
        String code = "123456";

        Otp otp = new Otp();
        otp.setMobile(mobile);
        otp.setOtp(code);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setUsed(false);

        when(otpRepository.findTopByMobileOrderByIdDesc(mobile)).thenReturn(Optional.of(otp));

        boolean result = otpService.verifyOtp(mobile, code);

        assertTrue(result);
        assertTrue(otp.isUsed());
        verify(otpRepository).save(otp);
    }

    @Test
    void verifyOtp_IncorrectCode_ShouldReturnFalse() {
        String mobile = "9876543210";

        Otp otp = new Otp();
        otp.setMobile(mobile);
        otp.setOtp("123456");
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setUsed(false);

        when(otpRepository.findTopByMobileOrderByIdDesc(mobile)).thenReturn(Optional.of(otp));

        boolean result = otpService.verifyOtp(mobile, "654321");

        assertFalse(result);
        assertFalse(otp.isUsed());
    }

    @Test
    void verifyOtp_ExpiredOtp_ShouldReturnFalse() {
        String mobile = "9876543210";
        String code = "123456";

        Otp otp = new Otp();
        otp.setMobile(mobile);
        otp.setOtp(code);
        otp.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        otp.setUsed(false);

        when(otpRepository.findTopByMobileOrderByIdDesc(mobile)).thenReturn(Optional.of(otp));

        boolean result = otpService.verifyOtp(mobile, code);

        assertFalse(result);
    }

    @Test
    void verifyOtp_AlreadyUsedOtp_ShouldReturnFalse() {
        String mobile = "9876543210";
        String code = "123456";

        Otp otp = new Otp();
        otp.setMobile(mobile);
        otp.setOtp(code);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setUsed(true);

        when(otpRepository.findTopByMobileOrderByIdDesc(mobile)).thenReturn(Optional.of(otp));

        boolean result = otpService.verifyOtp(mobile, code);

        assertFalse(result);
    }
}
