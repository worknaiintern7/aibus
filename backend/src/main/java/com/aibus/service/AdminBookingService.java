package com.aibus.service;

import com.aibus.dto.admin.booking.AdminBookingResponse;
import com.aibus.dto.booking.BookingDetailsResponse;
import com.aibus.dto.booking.CancelBookingResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Admin;
import com.aibus.entity.Booking;
import com.aibus.entity.BookingStatus;
import com.aibus.entity.GdsBooking;
import com.aibus.exception.BookingException;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.BookingRepository;
import com.aibus.repository.GdsBookingRepository;
import com.aibus.service.gds.GdsBookingService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final GdsBookingRepository gdsBookingRepository;
    private final BookingService bookingService;
    private final GdsBookingService gdsBookingService;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

    public AdminBookingService(BookingRepository bookingRepository,
                               GdsBookingRepository gdsBookingRepository,
                               BookingService bookingService,
                               GdsBookingService gdsBookingService,
                               AdminMapper adminMapper,
                               AdminAuditService adminAuditService) {
        this.bookingRepository = bookingRepository;
        this.gdsBookingRepository = gdsBookingRepository;
        this.bookingService = bookingService;
        this.gdsBookingService = gdsBookingService;
        this.adminMapper = adminMapper;
        this.adminAuditService = adminAuditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminBookingResponse> getBookings(String search, BookingStatus status, Pageable pageable) {
        List<AdminBookingResponse> allList = new ArrayList<>();

        // 1. In-house bookings
        List<Booking> localList;
        if (status != null) {
            localList = bookingRepository.findAll().stream().filter(b -> b.getStatus() == status).toList();
        } else if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            localList = bookingRepository.findAll().stream().filter(b ->
                (b.getBookingReference() != null && b.getBookingReference().toLowerCase().contains(q)) ||
                (b.getUser() != null && b.getUser().getMobile() != null && b.getUser().getMobile().contains(q))
            ).toList();
        } else {
            localList = bookingRepository.findAll();
        }
        for (Booking b : localList) {
            allList.add(adminMapper.toAdminBookingResponse(b));
        }

        // 2. GDS website bookings
        List<GdsBooking> gdsList;
        if (status != null) {
            gdsList = gdsBookingRepository.findAll().stream().filter(g -> g.getStatus() == status).toList();
        } else if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            gdsList = gdsBookingRepository.findAll().stream().filter(g ->
                (g.getBookingReference() != null && g.getBookingReference().toLowerCase().contains(q)) ||
                (g.getContactMobile() != null && g.getContactMobile().contains(q)) ||
                (g.getPnrNo() != null && g.getPnrNo().toLowerCase().contains(q)) ||
                (g.getTicketNo() != null && g.getTicketNo().toLowerCase().contains(q))
            ).toList();
        } else {
            gdsList = gdsBookingRepository.findAll();
        }
        for (GdsBooking g : gdsList) {
            allList.add(adminMapper.toAdminBookingResponse(g));
        }

        // 3. Sort by createdAt descending
        allList.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        // 4. Memory-safe pagination
        int total = allList.size();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), total);
        List<AdminBookingResponse> pageContent = (start < total) ? allList.subList(start, end) : List.of();
        int totalPages = (int) Math.ceil((double) total / pageable.getPageSize());
        if (totalPages == 0) totalPages = 1;

        return new PageResponse<>(pageContent, pageable.getPageNumber(), pageable.getPageSize(), total, totalPages);
    }

    @Transactional(readOnly = true)
    public BookingDetailsResponse getBookingDetails(String bookingReference) {
        try {
            return bookingService.getBookingDetails(bookingReference);
        } catch (ResourceNotFoundException e) {
            return gdsBookingService.findBookingDetails(bookingReference)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + bookingReference));
        }
    }

    @Transactional
    public CancelBookingResponse cancelBooking(String bookingReference, Admin currentAdmin) {
        CancelBookingResponse response;
        Optional<BookingDetailsResponse> gdsBooking = gdsBookingService.findBookingDetails(bookingReference);
        if (gdsBooking.isPresent()) {
            response = gdsBookingService.cancelBooking(bookingReference)
                    .orElseThrow(() -> new BookingException("Could not cancel GDS booking: " + bookingReference));
        } else {
            response = bookingService.cancelBooking(bookingReference);
        }
        adminAuditService.log(currentAdmin, "BOOKING_CANCELLED", "Booking", bookingReference, "Admin cancelled booking " + bookingReference);
        return response;
    }
}
