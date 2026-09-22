package com.aibus.controller;

import com.aibus.dto.admin.report.AdminRevenueReportResponse;
import com.aibus.dto.common.ApiResponse;
import com.aibus.service.AdminReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final AdminReportService adminReportService;

    public AdminReportController(AdminReportService adminReportService) {
        this.adminReportService = adminReportService;
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<AdminRevenueReportResponse>> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        AdminRevenueReportResponse response = adminReportService.getRevenueReport(from, to);
        return ResponseEntity.ok(ApiResponse.success("Revenue report generated successfully", response));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<AdminRevenueReportResponse>> getBookingReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        AdminRevenueReportResponse response = adminReportService.getRevenueReport(from, to);
        return ResponseEntity.ok(ApiResponse.success("Booking report generated successfully", response));
    }

    @GetMapping("/cancellations")
    public ResponseEntity<ApiResponse<AdminRevenueReportResponse>> getCancellationReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        AdminRevenueReportResponse response = adminReportService.getRevenueReport(from, to);
        return ResponseEntity.ok(ApiResponse.success("Cancellation report generated successfully", response));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<AdminRevenueReportResponse>> getUserReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        AdminRevenueReportResponse response = adminReportService.getRevenueReport(from, to);
        return ResponseEntity.ok(ApiResponse.success("User activity report generated successfully", response));
    }
}
