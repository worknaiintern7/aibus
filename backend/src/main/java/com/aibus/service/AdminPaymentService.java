package com.aibus.service;

import com.aibus.dto.admin.payment.AdminPaymentResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Payment;
import com.aibus.entity.PaymentStatus;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;
    private final AdminMapper adminMapper;

    public AdminPaymentService(PaymentRepository paymentRepository, AdminMapper adminMapper) {
        this.paymentRepository = paymentRepository;
        this.adminMapper = adminMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminPaymentResponse> getPayments(PaymentStatus status, Pageable pageable) {
        Page<Payment> page;
        if (status != null) {
            page = paymentRepository.findByStatus(status, pageable);
        } else {
            page = paymentRepository.findAll(pageable);
        }
        List<AdminPaymentResponse> content = page.getContent().stream()
                .map(adminMapper::toAdminPaymentResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Transactional(readOnly = true)
    public AdminPaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new com.aibus.exception.ResourceNotFoundException("Payment record not found with id: " + id));
        return adminMapper.toAdminPaymentResponse(payment);
    }
}
