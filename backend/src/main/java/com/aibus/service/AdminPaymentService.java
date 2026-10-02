package com.aibus.service;

import com.aibus.dto.admin.payment.AdminPaymentResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.GdsBooking;
import com.aibus.entity.Payment;
import com.aibus.entity.PaymentStatus;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.GdsBookingRepository;
import com.aibus.repository.PaymentRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;
    private final GdsBookingRepository gdsBookingRepository;
    private final AdminMapper adminMapper;

    public AdminPaymentService(PaymentRepository paymentRepository,
                               GdsBookingRepository gdsBookingRepository,
                               AdminMapper adminMapper) {
        this.paymentRepository = paymentRepository;
        this.gdsBookingRepository = gdsBookingRepository;
        this.adminMapper = adminMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminPaymentResponse> getPayments(PaymentStatus status, Pageable pageable) {
        List<AdminPaymentResponse> allList = new ArrayList<>();

        // 1. In-house payments
        List<Payment> payments = paymentRepository.findAll();
        for (Payment p : payments) {
            AdminPaymentResponse mapped = adminMapper.toAdminPaymentResponse(p);
            if (status == null || mapped.getStatus() == status) {
                allList.add(mapped);
            }
        }

        // 2. GDS transactions
        List<GdsBooking> gdsBookings = gdsBookingRepository.findAll();
        for (GdsBooking g : gdsBookings) {
            AdminPaymentResponse mapped = adminMapper.toAdminPaymentResponse(g);
            if (status == null || mapped.getStatus() == status) {
                allList.add(mapped);
            }
        }

        // 3. Sort by createdAt descending
        allList.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        // 4. Paginate
        int total = allList.size();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), total);
        List<AdminPaymentResponse> pageContent = (start < total) ? allList.subList(start, end) : List.of();
        int totalPages = (int) Math.ceil((double) total / pageable.getPageSize());
        if (totalPages == 0) totalPages = 1;

        return new PageResponse<>(pageContent, pageable.getPageNumber(), pageable.getPageSize(), total, totalPages);
    }

    @Transactional(readOnly = true)
    public AdminPaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id).orElse(null);
        if (payment != null) {
            return adminMapper.toAdminPaymentResponse(payment);
        }
        GdsBooking gds = gdsBookingRepository.findById(id).orElse(null);
        if (gds != null) {
            return adminMapper.toAdminPaymentResponse(gds);
        }
        throw new com.aibus.exception.ResourceNotFoundException("Payment record not found with id: " + id);
    }
}
