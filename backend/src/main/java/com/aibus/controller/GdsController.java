package com.aibus.controller;

import com.aibus.dto.booking.BookingDetailsResponse;
import com.aibus.dto.booking.CancellationQuoteResponse;
import com.aibus.dto.booking.GdsHoldRequest;
import com.aibus.dto.bus.GdsBusDetailsResponse;
import com.aibus.dto.common.ApiResponse;
import com.aibus.service.gds.GdsBookingService;
import com.aibus.service.gds.GdsBusService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Live buses of the GDS provider: seat chart, hold and book.
 * Booking details and cancellation go through the regular /api/bookings endpoints.
 */
@RestController
@RequestMapping("/api/gds")
public class GdsController {

    private final GdsBusService gdsBusService;
    private final GdsBookingService gdsBookingService;
    private final com.aibus.service.gds.GdsApiService gdsApiService;

    public GdsController(GdsBusService gdsBusService,
                         GdsBookingService gdsBookingService,
                         com.aibus.service.gds.GdsApiService gdsApiService) {
        this.gdsBusService = gdsBusService;
        this.gdsBookingService = gdsBookingService;
        this.gdsApiService = gdsApiService;
    }

    @GetMapping("/buses/{busId}")
    public ResponseEntity<ApiResponse<GdsBusDetailsResponse>> getBusDetails(
            @PathVariable int busId,
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        GdsBusDetailsResponse response = gdsBusService.getBusDetails(source, destination, date, busId);
        return ResponseEntity.ok(ApiResponse.success("Bus details retrieved successfully", response));
    }

    @PostMapping("/bookings/hold")
    public ResponseEntity<ApiResponse<BookingDetailsResponse>> holdSeats(@Valid @RequestBody GdsHoldRequest request) {
        BookingDetailsResponse response = gdsBookingService.holdSeats(request);
        return ResponseEntity.ok(ApiResponse.success("Seats held successfully", response));
    }

    @PostMapping("/bookings/{bookingReference}/confirm")
    public ResponseEntity<ApiResponse<BookingDetailsResponse>> confirmBooking(@PathVariable String bookingReference) {
        BookingDetailsResponse response = gdsBookingService.confirmBooking(bookingReference);
        return ResponseEntity.ok(ApiResponse.success("Booking confirmed successfully", response));
    }

    @GetMapping("/bookings/{bookingReference}/cancellation")
    public ResponseEntity<ApiResponse<CancellationQuoteResponse>> getCancellationQuote(@PathVariable String bookingReference) {
        CancellationQuoteResponse response = gdsBookingService.getCancellationQuote(bookingReference);
        return ResponseEntity.ok(ApiResponse.success("Cancellation details retrieved successfully", response));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getAgentBalance() {
        java.util.Map<String, Object> response = gdsApiService.getAgentBalance();
        return ResponseEntity.ok(ApiResponse.success("Agent balance retrieved successfully", response));
    }

    @GetMapping("/booking-details")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getBookingDetails(
            @RequestParam String pnr,
            @RequestParam String ticketNo) {
        java.util.Map<String, Object> response = gdsApiService.getBookingDetails(pnr, ticketNo);
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully", response));
    }

    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> searchCities(
            @RequestParam(required = false, defaultValue = "") String query) {
        java.util.List<java.util.Map<String, Object>> response = gdsApiService.searchCities(query);
        return ResponseEntity.ok(ApiResponse.success("Cities retrieved successfully", response));
    }
}
