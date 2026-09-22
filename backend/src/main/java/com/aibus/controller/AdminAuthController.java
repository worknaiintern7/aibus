package com.aibus.controller;

import com.aibus.dto.admin.auth.AdminAuthResponse;
import com.aibus.dto.admin.auth.AdminLoginRequest;
import com.aibus.dto.admin.auth.AdminProfileResponse;
import com.aibus.dto.common.ApiResponse;
import com.aibus.entity.Admin;
import com.aibus.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminAuthResponse>> login(@Valid @RequestBody AdminLoginRequest request) {
        AdminAuthResponse response = adminAuthService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Admin login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AdminProfileResponse>> getProfile(HttpServletRequest request) {
        Admin currentAdmin = (Admin) request.getAttribute("currentAdmin");
        AdminProfileResponse response = adminAuthService.getProfile(currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Admin profile fetched successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Admin logged out successfully", null));
    }
}
