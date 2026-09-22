package com.aibus.controller;

import com.aibus.dto.booking.BookingDetailsResponse;
import com.aibus.dto.booking.BookingResponse;
import com.aibus.dto.booking.CancelBookingResponse;
import com.aibus.dto.booking.CreateBookingRequest;
import com.aibus.dto.common.ApiResponse;
import com.aibus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", response));
    }

    @GetMapping("/{bookingReference}")
    public ResponseEntity<ApiResponse<BookingDetailsResponse>> getBookingDetails(@PathVariable String bookingReference) {
        BookingDetailsResponse response = bookingService.getBookingDetails(bookingReference);
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully", response));
    }

    @PostMapping("/{bookingReference}/cancel")
    public ResponseEntity<ApiResponse<CancelBookingResponse>> cancelBooking(@PathVariable String bookingReference) {
        CancelBookingResponse response = bookingService.cancelBooking(bookingReference);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", response));
    }
}
