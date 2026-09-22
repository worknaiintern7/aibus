package com.aibus.security;

import com.aibus.entity.Admin;
import com.aibus.exception.InactiveAdminException;
import com.aibus.exception.UnauthorizedAdminException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private final AdminTokenService adminTokenService;

    public AdminAuthInterceptor(AdminTokenService adminTokenService) {
        this.adminTokenService = adminTokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        if (uri.endsWith("/api/admin/auth/login") || request.getMethod().equalsIgnoreCase("OPTIONS")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            token = request.getHeader("X-Admin-Token");
        }

        if (token == null || token.isBlank()) {
            throw new UnauthorizedAdminException("Unauthorized admin request. Valid bearer token required.");
        }

        Optional<Admin> adminOpt = adminTokenService.validateToken(token);
        if (adminOpt.isEmpty()) {
            throw new UnauthorizedAdminException("Invalid or expired admin token.");
        }

        Admin admin = adminOpt.get();

        if (!admin.isActive()) {
            throw new InactiveAdminException("Admin account is inactive.");
        }

        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new UnauthorizedAdminException("Access denied. Admin role required.");
        }

        request.setAttribute("currentAdmin", admin);
        return true;
    }
}
