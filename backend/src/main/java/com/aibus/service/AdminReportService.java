package com.aibus.service;

import com.aibus.dto.admin.report.AdminRevenueReportResponse;
import com.aibus.entity.BookingStatus;
import com.aibus.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class AdminReportService {

    private final BookingRepository bookingRepository;

    public AdminReportService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public AdminRevenueReportResponse getRevenueReport(LocalDate from, LocalDate to) {
        LocalDate startDate = (from != null) ? from : LocalDate.now().minusDays(30);
        LocalDate endDate = (to != null) ? to : LocalDate.now();

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        long totalBookings = bookingRepository.countByCreatedAtBetween(startDateTime, endDateTime);
        long confirmed = bookingRepository.countByStatusAndCreatedAtBetween(BookingStatus.CONFIRMED, startDateTime, endDateTime);
        long cancelled = bookingRepository.countByStatusAndCreatedAtBetween(BookingStatus.CANCELLED, startDateTime, endDateTime);
        BigDecimal revenue = bookingRepository.calculateRevenueInPeriod(startDateTime, endDateTime);

        AdminRevenueReportResponse report = new AdminRevenueReportResponse();
        report.setTotalBookings(totalBookings);
        report.setConfirmedBookings(confirmed);
        report.setCancelledBookings(cancelled);
        report.setSuccessfulPayments(confirmed);
        report.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);
        report.setFrom(startDate);
        report.setTo(endDate);

        return report;
    }
}
