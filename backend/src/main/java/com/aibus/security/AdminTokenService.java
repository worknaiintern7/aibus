package com.aibus.security;

import com.aibus.entity.Admin;
import com.aibus.repository.AdminRepository;
import com.aibus.util.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminTokenService {

    private final PasswordEncoder passwordEncoder;
    private final AdminRepository adminRepository;

    public AdminTokenService(PasswordEncoder passwordEncoder, AdminRepository adminRepository) {
        this.passwordEncoder = passwordEncoder;
        this.adminRepository = adminRepository;
    }

    public String generateToken(Admin admin) {
        long timestamp = System.currentTimeMillis();
        String payload = admin.getId() + ":" + admin.getEmail() + ":" + timestamp;
        String signature = passwordEncoder.encode(payload + ":AIBUS_ADMIN_SECRET");
        return "AIBUS-ADMIN-TOKEN." + admin.getId() + "." + timestamp + "." + signature;
    }

    public Optional<Admin> validateToken(String token) {
        if (token == null || !token.startsWith("AIBUS-ADMIN-TOKEN.")) {
            return Optional.empty();
        }
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 4) {
                return Optional.empty();
            }
            Long adminId = Long.parseLong(parts[1]);
            long timestamp = Long.parseLong(parts[2]);
            String signature = parts[3];

            Optional<Admin> adminOpt = adminRepository.findById(adminId);
            if (adminOpt.isEmpty()) {
                return Optional.empty();
            }

            Admin admin = adminOpt.get();
            String payload = admin.getId() + ":" + admin.getEmail() + ":" + timestamp;
            String expectedSignature = passwordEncoder.encode(payload + ":AIBUS_ADMIN_SECRET");

            if (!expectedSignature.equalsIgnoreCase(signature)) {
                return Optional.empty();
            }

            return Optional.of(admin);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
