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
import com.aibus.dto.gds.GdsSearchResponse;
import com.aibus.service.gds.GdsApiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BusService {

    private static final Logger log = LoggerFactory.getLogger(BusService.class);

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

        List<BusSchedule> schedules = busScheduleRepository
                .findByRouteSourceIgnoreCaseAndRouteDestinationIgnoreCaseAndJourneyDateAndStatus(
                        source,
                        destination,
                        date,
                        ScheduleStatus.SCHEDULED
                );

        List<BusSearchResponse> results = schedules.stream()
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
                .collect(Collectors.toCollection(ArrayList::new));

        results.addAll(searchGdsBuses(source, destination, date));

        return results;
    }

    /*
     * Live buses from the GDS provider. A provider failure must not break
     * the search, so our own schedules are still returned in that case.
     */
    private List<BusSearchResponse> searchGdsBuses(
            String source,
            String destination,
            LocalDate date) {

        if (!gdsApiService.isConfigured()) {
            return List.of();
        }

        try {
            Optional<Integer> fromCityId = gdsApiService.findCityId(source);
            Optional<Integer> toCityId = gdsApiService.findCityId(destination);

            if (fromCityId.isEmpty() || toCityId.isEmpty()) {
                log.info("GDS search skipped, city not found in GDS city list: {} -> {}", source, destination);
                return List.of();
            }

            GdsSearchResponse gdsResponse = gdsApiService.searchBuses(
                    fromCityId.get(),
                    toCityId.get(),
                    date.toString()
            );

            if (gdsResponse == null
                    || !gdsResponse.isSuccess()
                    || gdsResponse.getData() == null
                    || gdsResponse.getData().getBuses() == null) {
                return List.of();
            }

            return gdsResponse.getData().getBuses().stream()
                    .map(bus -> busMapper.toBusSearchResponse(bus, source, destination, date))
                    .collect(Collectors.toList());

        } catch (RuntimeException ex) {
            log.warn("GDS search failed for {} -> {} on {}: {}", source, destination, date, ex.getMessage());
            return List.of();
        }
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