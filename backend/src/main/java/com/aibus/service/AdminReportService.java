package com.aibus.service;

import com.aibus.dto.admin.report.AdminRevenueReportResponse;
import com.aibus.entity.BookingStatus;
import com.aibus.repository.BookingRepository;
import com.aibus.repository.GdsBookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class AdminReportService {

    private final BookingRepository bookingRepository;
    private final GdsBookingRepository gdsBookingRepository;

    public AdminReportService(BookingRepository bookingRepository, GdsBookingRepository gdsBookingRepository) {
        this.bookingRepository = bookingRepository;
        this.gdsBookingRepository = gdsBookingRepository;
    }

    @Transactional(readOnly = true)
    public AdminRevenueReportResponse getRevenueReport(LocalDate from, LocalDate to) {
        LocalDate startDate = (from != null) ? from : LocalDate.now().minusDays(30);
        LocalDate endDate = (to != null) ? to : LocalDate.now();

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        long localBookings = bookingRepository.countByCreatedAtBetween(startDateTime, endDateTime);
        long gdsBookings = gdsBookingRepository.countByCreatedAtBetween(startDateTime, endDateTime);

        long localConfirmed = bookingRepository.countByStatusAndCreatedAtBetween(BookingStatus.CONFIRMED, startDateTime, endDateTime);
        long gdsConfirmed = gdsBookingRepository.countByStatusAndCreatedAtBetween(BookingStatus.CONFIRMED, startDateTime, endDateTime);

        long localCancelled = bookingRepository.countByStatusAndCreatedAtBetween(BookingStatus.CANCELLED, startDateTime, endDateTime);
        long gdsCancelled = gdsBookingRepository.countByStatusAndCreatedAtBetween(BookingStatus.CANCELLED, startDateTime, endDateTime);

        BigDecimal localRevenue = bookingRepository.calculateRevenueInPeriod(startDateTime, endDateTime);
        if (localRevenue == null) localRevenue = BigDecimal.ZERO;

        BigDecimal gdsRevenue = gdsBookingRepository.calculateRevenueInPeriod(BookingStatus.CONFIRMED, startDateTime, endDateTime);
        if (gdsRevenue == null) gdsRevenue = BigDecimal.ZERO;

        AdminRevenueReportResponse report = new AdminRevenueReportResponse();
        report.setTotalBookings(localBookings + gdsBookings);
        report.setConfirmedBookings(localConfirmed + gdsConfirmed);
        report.setCancelledBookings(localCancelled + gdsCancelled);
        report.setSuccessfulPayments(localConfirmed + gdsConfirmed);
        report.setTotalRevenue(localRevenue.add(gdsRevenue));
        report.setFrom(startDate);
        report.setTo(endDate);

        return report;
    }
}
