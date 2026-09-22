package com.aibus.service;

import com.aibus.dto.admin.booking.AdminBookingResponse;
import com.aibus.dto.booking.BookingDetailsResponse;
import com.aibus.dto.booking.CancelBookingResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Admin;
import com.aibus.entity.Booking;
import com.aibus.entity.BookingStatus;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.BookingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

    public AdminBookingService(BookingRepository bookingRepository,
                               BookingService bookingService,
                               AdminMapper adminMapper,
                               AdminAuditService adminAuditService) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.adminMapper = adminMapper;
        this.adminAuditService = adminAuditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminBookingResponse> getBookings(String search, BookingStatus status, Pageable pageable) {
        Page<Booking> page;
        if (status != null) {
            page = bookingRepository.findByStatus(status, pageable);
        } else if (search != null && !search.isBlank()) {
            page = bookingRepository.findByBookingReferenceContainingIgnoreCaseOrUserMobileContaining(search.trim(), search.trim(), pageable);
        } else {
            page = bookingRepository.findAll(pageable);
        }

        List<AdminBookingResponse> content = page.getContent().stream()
                .map(adminMapper::toAdminBookingResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Transactional(readOnly = true)
    public BookingDetailsResponse getBookingDetails(String bookingReference) {
        return bookingService.getBookingDetails(bookingReference);
    }

    @Transactional
    public CancelBookingResponse cancelBooking(String bookingReference, Admin currentAdmin) {
        // Reuse Part A BookingService cancellation logic to avoid duplication
        CancelBookingResponse response = bookingService.cancelBooking(bookingReference);
        adminAuditService.log(currentAdmin, "BOOKING_CANCELLED", "Booking", bookingReference, "Admin cancelled booking " + bookingReference);
        return response;
    }
}
