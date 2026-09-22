package com.aibus.service;

import com.aibus.dto.admin.auth.AdminAuthResponse;
import com.aibus.dto.admin.auth.AdminLoginRequest;
import com.aibus.dto.admin.auth.AdminProfileResponse;
import com.aibus.entity.Admin;
import com.aibus.exception.InactiveAdminException;
import com.aibus.exception.UnauthorizedAdminException;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.AdminRepository;
import com.aibus.security.AdminTokenService;
import com.aibus.util.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminTokenService adminTokenService;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

    public AdminAuthService(AdminRepository adminRepository,
                            PasswordEncoder passwordEncoder,
                            AdminTokenService adminTokenService,
                            AdminMapper adminMapper,
                            AdminAuditService adminAuditService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminTokenService = adminTokenService;
        this.adminMapper = adminMapper;
        this.adminAuditService = adminAuditService;
    }

    @Transactional
    public AdminAuthResponse login(AdminLoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedAdminException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new UnauthorizedAdminException("Invalid email or password");
        }

        if (!admin.isActive()) {
            throw new InactiveAdminException("Admin account is inactive. Please contact support.");
        }

        String token = adminTokenService.generateToken(admin);
        AdminProfileResponse profile = adminMapper.toAdminProfileResponse(admin);

        adminAuditService.log(admin, "ADMIN_LOGIN", "Admin", String.valueOf(admin.getId()), "Admin logged in successfully");

        return new AdminAuthResponse(token, profile);
    }

    public AdminProfileResponse getProfile(Admin admin) {
        return adminMapper.toAdminProfileResponse(admin);
    }
}
