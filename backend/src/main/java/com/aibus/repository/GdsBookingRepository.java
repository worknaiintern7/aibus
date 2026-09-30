package com.aibus.repository;

import com.aibus.entity.GdsBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GdsBookingRepository extends JpaRepository<GdsBooking, Long> {

    Optional<GdsBooking> findByBookingReference(String bookingReference);

    List<GdsBooking> findByUserIdOrderByCreatedAtDesc(Long userId);
}
