package com.aibus.repository;

import com.aibus.entity.ScheduleSeat;
import com.aibus.entity.SeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScheduleSeatRepository extends JpaRepository<ScheduleSeat, Long> {

    List<ScheduleSeat> findByBusScheduleId(Long scheduleId);

    List<ScheduleSeat> findByBusScheduleIdAndSeatSeatNumberIn(Long scheduleId, List<String> seatNumbers);

    long countByBusScheduleIdAndStatus(Long scheduleId, SeatStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ss FROM ScheduleSeat ss WHERE ss.busSchedule.id = :scheduleId AND ss.seat.seatNumber IN :seatNumbers")
    List<ScheduleSeat> findSeatsForBookingForUpdate(@Param("scheduleId") Long scheduleId, @Param("seatNumbers") List<String> seatNumbers);
}
