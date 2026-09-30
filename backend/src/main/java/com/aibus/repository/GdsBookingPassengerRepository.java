package com.aibus.repository;

import com.aibus.entity.GdsBookingPassenger;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GdsBookingPassengerRepository extends JpaRepository<GdsBookingPassenger, Long> {
    List<GdsBookingPassenger> findByBookingIdOrderByIdAsc(Long bookingId);
}
