package com.aibus.repository;

import com.aibus.entity.BusSchedule;
import com.aibus.entity.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BusScheduleRepository extends JpaRepository<BusSchedule, Long> {
    List<BusSchedule> findByRouteSourceIgnoreCaseAndRouteDestinationIgnoreCaseAndJourneyDateAndStatus(
            String source, String destination, LocalDate journeyDate, ScheduleStatus status
    );

    long countByJourneyDateGreaterThanEqual(LocalDate date);
}
