package com.aibus.controller;

import com.aibus.dto.auth.AuthResponse;
import com.aibus.dto.auth.SendOtpRequest;
import com.aibus.dto.auth.VerifyOtpRequest;
import com.aibus.dto.common.ApiResponse;
import com.aibus.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        AuthResponse response = authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }
}
