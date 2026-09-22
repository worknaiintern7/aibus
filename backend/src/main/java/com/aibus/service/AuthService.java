package com.aibus.service;

import com.aibus.dto.auth.AuthResponse;
import com.aibus.dto.auth.SendOtpRequest;
import com.aibus.dto.auth.VerifyOtpRequest;
import com.aibus.dto.user.UserResponse;
import com.aibus.entity.Otp;
import com.aibus.entity.User;
import com.aibus.exception.InvalidOtpException;
import com.aibus.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserService userService;
    private final OtpService otpService;
    private final UserMapper userMapper;

    public AuthService(UserService userService, OtpService otpService, UserMapper userMapper) {
        this.userService = userService;
        this.otpService = otpService;
        this.userMapper = userMapper;
    }

    @Transactional
    public AuthResponse sendOtp(SendOtpRequest request) {
        String mobile = request.getMobile();

        userService.findOrCreateUser(mobile);
        Otp otp = otpService.generateAndSaveOtp(mobile);

        logger.info("Generated OTP for {}: {}", mobile, otp.getOtp());

        return new AuthResponse(true, "OTP generated successfully");
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String mobile = request.getMobile();
        String otpCode = request.getOtp();

        boolean isValid = otpService.verifyOtp(mobile, otpCode);

        if (!isValid) {
            throw new InvalidOtpException("Invalid or expired OTP");
        }

        User user = userService.findOrCreateUser(mobile);
        UserResponse userResponse = userMapper.toUserResponse(user);

        return new AuthResponse(true, "Login successful", userResponse);
    }
}
