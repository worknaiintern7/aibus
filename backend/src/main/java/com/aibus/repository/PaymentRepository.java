package com.aibus.repository;

import com.aibus.entity.Payment;
import com.aibus.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
}
