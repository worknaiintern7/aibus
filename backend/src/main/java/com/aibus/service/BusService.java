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
import com.aibus.service.gds.GdsApiService;
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
    private final GdsApiService gdsApiService;

    public BusService(BusScheduleRepository busScheduleRepository,
                      ScheduleSeatRepository scheduleSeatRepository,
                      BusMapper busMapper,
                      GdsApiService gdsApiService) {
        this.busScheduleRepository = busScheduleRepository;
        this.scheduleSeatRepository = scheduleSeatRepository;
        this.busMapper = busMapper;
        this.gdsApiService = gdsApiService;
    }

    @Transactional(readOnly = true)
    public List<BusSearchResponse> searchBuses(
            String source,
            String destination,
            LocalDate date) {

        /*
         * TEMPORARY GDS TEST
         *
         * This calls the GDS provider API.
         * We are not converting the GDS response to our DTO yet.
         */
        com.aibus.dto.gds.GdsSearchResponse gdsResponse = gdsApiService.searchBuses(
                4292,
                4562,
                date.toString()
        );

        System.out.println("========== GDS API RESPONSE ==========");
        System.out.println(gdsResponse);
        System.out.println("======================================");

        /*
         * Existing database search is kept for now.
         * Next step will replace this with GDS response mapping.
         */
        List<BusSchedule> schedules = busScheduleRepository
                .findByRouteSourceIgnoreCaseAndRouteDestinationIgnoreCaseAndJourneyDateAndStatus(
                        source,
                        destination,
                        date,
                        ScheduleStatus.SCHEDULED
                );

        return schedules.stream()
                .map(schedule -> {
                    long availableSeats = scheduleSeatRepository
                            .countByBusScheduleIdAndStatus(
                                    schedule.getId(),
                                    SeatStatus.AVAILABLE
                            );

                    return busMapper.toBusSearchResponse(
                            schedule,
                            availableSeats
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BusDetailsResponse getBusDetails(Long scheduleId) {

        BusSchedule schedule = busScheduleRepository
                .findById(scheduleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bus schedule not found with id: " + scheduleId
                        )
                );

        List<ScheduleSeat> scheduleSeats =
                scheduleSeatRepository.findByBusScheduleId(scheduleId);

        long availableSeatsCount = scheduleSeats.stream()
                .filter(ss -> ss.getStatus() == SeatStatus.AVAILABLE)
                .count();

        List<SeatResponse> seatResponses = scheduleSeats.stream()
                .map(busMapper::toSeatResponse)
                .collect(Collectors.toList());

        return busMapper.toBusDetailsResponse(
                schedule,
                availableSeatsCount,
                seatResponses
        );
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatAvailability(Long scheduleId) {

        if (!busScheduleRepository.existsById(scheduleId)) {
            throw new ResourceNotFoundException(
                    "Bus schedule not found with id: " + scheduleId
            );
        }

        List<ScheduleSeat> scheduleSeats =
                scheduleSeatRepository.findByBusScheduleId(scheduleId);

        return scheduleSeats.stream()
                .map(busMapper::toSeatResponse)
                .collect(Collectors.toList());
    }
}