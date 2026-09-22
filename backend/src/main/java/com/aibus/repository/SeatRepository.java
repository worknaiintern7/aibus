package com.aibus.repository;

import com.aibus.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByBusIdOrderByRowNumberAscColumnNumberAsc(Long busId);
}
