package com.aibus.service;

import com.aibus.dto.bus.BusDetailsResponse;
import com.aibus.dto.bus.BusSearchResponse;
import com.aibus.dto.bus.SeatResponse;
import com.aibus.entity.BusSchedule;
import com.aibus.entity.ScheduleSeat;
import com.aibus.entity.ScheduleStatus;
import com.aibus.entity.SeatStatus;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.mapper.BusMapper;
import com.aibus.repository.BusScheduleRepository;
import com.aibus.repository.ScheduleSeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusService {

    private final BusScheduleRepository busScheduleRepository;
    private final ScheduleSeatRepository scheduleSeatRepository;
    private final BusMapper busMapper;

    public BusService(BusScheduleRepository busScheduleRepository,
                      ScheduleSeatRepository scheduleSeatRepository,
                      BusMapper busMapper) {
        this.busScheduleRepository = busScheduleRepository;
        this.scheduleSeatRepository = scheduleSeatRepository;
        this.busMapper = busMapper;
    }

    @Transactional(readOnly = true)
    public List<BusSearchResponse> searchBuses(String source, String destination, LocalDate date) {
        List<BusSchedule> schedules = busScheduleRepository
                .findByRouteSourceIgnoreCaseAndRouteDestinationIgnoreCaseAndJourneyDateAndStatus(
                        source, destination, date, ScheduleStatus.SCHEDULED
                );

        return schedules.stream().map(schedule -> {
            long availableSeats = scheduleSeatRepository
                    .countByBusScheduleIdAndStatus(schedule.getId(), SeatStatus.AVAILABLE);
            return busMapper.toBusSearchResponse(schedule, availableSeats);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BusDetailsResponse getBusDetails(Long scheduleId) {
        BusSchedule schedule = busScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Bus schedule not found with id: " + scheduleId));

        List<ScheduleSeat> scheduleSeats = scheduleSeatRepository.findByBusScheduleId(scheduleId);
        long availableSeatsCount = scheduleSeats.stream()
                .filter(ss -> ss.getStatus() == SeatStatus.AVAILABLE)
                .count();

        List<SeatResponse> seatResponses = scheduleSeats.stream()
                .map(busMapper::toSeatResponse)
                .collect(Collectors.toList());

        return busMapper.toBusDetailsResponse(schedule, availableSeatsCount, seatResponses);
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatAvailability(Long scheduleId) {
        if (!busScheduleRepository.existsById(scheduleId)) {
            throw new ResourceNotFoundException("Bus schedule not found with id: " + scheduleId);
        }
        List<ScheduleSeat> scheduleSeats = scheduleSeatRepository.findByBusScheduleId(scheduleId);
        return scheduleSeats.stream()
                .map(busMapper::toSeatResponse)
                .collect(Collectors.toList());
    }
}
