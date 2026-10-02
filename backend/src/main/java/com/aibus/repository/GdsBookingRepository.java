package com.aibus.repository;

import com.aibus.entity.BookingStatus;
import com.aibus.entity.GdsBooking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GdsBookingRepository extends JpaRepository<GdsBooking, Long> {

    Optional<GdsBooking> findByBookingReference(String bookingReference);

    List<GdsBooking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<GdsBooking> findAllByOrderByCreatedAtDesc();

    Page<GdsBooking> findByStatus(BookingStatus status, Pageable pageable);

    Page<GdsBooking> findByBookingReferenceContainingIgnoreCaseOrContactMobileContaining(String ref, String mobile, Pageable pageable);

    long countByStatus(BookingStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatusAndCreatedAtBetween(BookingStatus status, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM GdsBooking b WHERE b.status = :status")
    BigDecimal calculateTotalRevenueByStatus(@Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM GdsBooking b WHERE b.status = :status AND b.createdAt BETWEEN :start AND :end")
    BigDecimal calculateRevenueInPeriod(@Param("status") BookingStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
