package com.aibus.repository;

import com.aibus.entity.Booking;
import com.aibus.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByStatus(BookingStatus status);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    Page<Booking> findByBookingReferenceContainingIgnoreCaseOrUserMobileContaining(String ref, String mobile, Pageable pageable);

    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.status = com.aibus.entity.BookingStatus.CONFIRMED OR b.status = com.aibus.entity.BookingStatus.COMPLETED")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE (b.status = com.aibus.entity.BookingStatus.CONFIRMED OR b.status = com.aibus.entity.BookingStatus.COMPLETED) AND b.createdAt >= :startDate AND b.createdAt <= :endDate")
    BigDecimal calculateRevenueInPeriod(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    long countByStatusAndCreatedAtBetween(BookingStatus status, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT b.busSchedule.id FROM Booking b WHERE b.user.id = :userId ORDER BY b.createdAt DESC LIMIT 1")
    Optional<Long> findLastBookingScheduleIdByUserId(@Param("userId") Long userId);
}
