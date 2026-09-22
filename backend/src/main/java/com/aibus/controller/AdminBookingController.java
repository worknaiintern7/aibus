package com.aibus.controller;

import com.aibus.dto.admin.booking.AdminBookingResponse;
import com.aibus.dto.booking.BookingDetailsResponse;
import com.aibus.dto.booking.CancelBookingResponse;
import com.aibus.dto.common.ApiResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Admin;
import com.aibus.entity.BookingStatus;
import com.aibus.service.AdminBookingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    public AdminBookingController(AdminBookingService adminBookingService) {
        this.adminBookingService = adminBookingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminBookingResponse>>> getBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BookingStatus status) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<AdminBookingResponse> response = adminBookingService.getBookings(search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", response));
    }

    @GetMapping("/{bookingReference}")
    public ResponseEntity<ApiResponse<BookingDetailsResponse>> getBookingDetails(@PathVariable String bookingReference) {
        BookingDetailsResponse response = adminBookingService.getBookingDetails(bookingReference);
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully", response));
    }

    @PostMapping("/{bookingReference}/cancel")
    public ResponseEntity<ApiResponse<CancelBookingResponse>> cancelBooking(
            @PathVariable String bookingReference,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        CancelBookingResponse response = adminBookingService.cancelBooking(bookingReference, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled by admin successfully", response));
    }
}
