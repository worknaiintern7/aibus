package com.aibus.service;

import com.aibus.dto.admin.audit.AdminAuditLogResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Admin;
import com.aibus.entity.AdminAuditLog;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.AdminAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminAuditService {

    private final AdminAuditLogRepository adminAuditLogRepository;
    private final AdminMapper adminMapper;

    public AdminAuditService(AdminAuditLogRepository adminAuditLogRepository, AdminMapper adminMapper) {
        this.adminAuditLogRepository = adminAuditLogRepository;
        this.adminMapper = adminMapper;
    }

    @Transactional
    public void log(Admin admin, String action, String entityType, String entityId, String description) {
        if (admin == null) return;
        AdminAuditLog log = new AdminAuditLog(
                admin.getId(),
                admin.getEmail(),
                action,
                entityType,
                entityId,
                description
        );
        adminAuditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminAuditLogResponse> getAuditLogs(Pageable pageable) {
        Page<AdminAuditLog> page = adminAuditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<AdminAuditLogResponse> content = page.getContent().stream()
                .map(adminMapper::toAdminAuditLogResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
