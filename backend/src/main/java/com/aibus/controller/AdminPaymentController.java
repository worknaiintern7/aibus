package com.aibus.controller;

import com.aibus.dto.admin.payment.AdminPaymentResponse;
import com.aibus.dto.common.ApiResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.PaymentStatus;
import com.aibus.service.AdminPaymentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    public AdminPaymentController(AdminPaymentService adminPaymentService) {
        this.adminPaymentService = adminPaymentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminPaymentResponse>>> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) PaymentStatus status) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<AdminPaymentResponse> response = adminPaymentService.getPayments(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Payment records retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminPaymentResponse>> getPaymentById(@PathVariable Long id) {
        AdminPaymentResponse response = adminPaymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved successfully", response));
    }
}
