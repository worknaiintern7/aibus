package com.aibus.service;

import com.aibus.dto.admin.schedule.AdminScheduleRequest;
import com.aibus.dto.admin.schedule.AdminScheduleResponse;
import com.aibus.dto.admin.schedule.UpdateScheduleStatusRequest;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.*;
import com.aibus.exception.InvalidRequestException;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminScheduleService {

    private final BusScheduleRepository busScheduleRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final SeatRepository seatRepository;
    private final ScheduleSeatRepository scheduleSeatRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

    public AdminScheduleService(BusScheduleRepository busScheduleRepository,
                                BusRepository busRepository,
                                RouteRepository routeRepository,
                                SeatRepository seatRepository,
                                ScheduleSeatRepository scheduleSeatRepository,
                                AdminMapper adminMapper,
                                AdminAuditService adminAuditService) {
        this.busScheduleRepository = busScheduleRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.seatRepository = seatRepository;
        this.scheduleSeatRepository = scheduleSeatRepository;
        this.adminMapper = adminMapper;
        this.adminAuditService = adminAuditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminScheduleResponse> getSchedules(Pageable pageable) {
        Page<BusSchedule> page = busScheduleRepository.findAll(pageable);
        List<AdminScheduleResponse> content = page.getContent().stream().map(schedule -> {
            long availableSeats = scheduleSeatRepository.countByBusScheduleIdAndStatus(schedule.getId(), SeatStatus.AVAILABLE);
            return adminMapper.toAdminScheduleResponse(schedule, availableSeats);
        }).collect(Collectors.toList());

        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Transactional(readOnly = true)
    public AdminScheduleResponse getScheduleById(Long id) {
        BusSchedule schedule = busScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus schedule not found with id: " + id));
        long availableSeats = scheduleSeatRepository.countByBusScheduleIdAndStatus(schedule.getId(), SeatStatus.AVAILABLE);
        return adminMapper.toAdminScheduleResponse(schedule, availableSeats);
    }

    @Transactional
    public AdminScheduleResponse createSchedule(AdminScheduleRequest request, Admin currentAdmin) {
        Bus bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + request.getBusId()));

        if (!bus.isActive()) {
            throw new InvalidRequestException("Cannot create schedule for an inactive bus");
        }

        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + request.getRouteId()));

        if (!route.isActive()) {
            throw new InvalidRequestException("Cannot create schedule for an inactive route");
        }

        BusSchedule schedule = new BusSchedule();
        schedule.setBus(bus);
        schedule.setRoute(route);
        schedule.setJourneyDate(request.getJourneyDate());
        schedule.setDepartureTime(request.getDepartureTime());
        schedule.setArrivalTime(request.getArrivalTime());
        schedule.setBoardingPoint(request.getBoardingPoint().trim());
        schedule.setDroppingPoint(request.getDroppingPoint().trim());
        schedule.setBaseFare(request.getBaseFare());
        schedule.setStatus(request.getStatus() != null ? request.getStatus() : ScheduleStatus.SCHEDULED);

        BusSchedule savedSchedule = busScheduleRepository.save(schedule);

        // Auto-initialize schedule_seats for all active seats of this bus
        List<Seat> busSeats = seatRepository.findByBusIdOrderByRowNumberAscColumnNumberAsc(bus.getId());
        List<ScheduleSeat> scheduleSeats = new ArrayList<>();
        for (Seat seat : busSeats) {
            if (seat.isActive()) {
                scheduleSeats.add(new ScheduleSeat(savedSchedule, seat, SeatStatus.AVAILABLE));
            }
        }
        scheduleSeatRepository.saveAll(scheduleSeats);

        adminAuditService.log(currentAdmin, "SCHEDULE_CREATED", "BusSchedule", String.valueOf(savedSchedule.getId()),
                "Created schedule for bus " + bus.getBusNumber() + " on " + request.getJourneyDate());

        return adminMapper.toAdminScheduleResponse(savedSchedule, scheduleSeats.size());
    }

    @Transactional
    public AdminScheduleResponse updateSchedule(Long id, AdminScheduleRequest request, Admin currentAdmin) {
        BusSchedule schedule = busScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus schedule not found with id: " + id));

        Bus bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + request.getBusId()));

        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + request.getRouteId()));

        schedule.setBus(bus);
        schedule.setRoute(route);
        schedule.setJourneyDate(request.getJourneyDate());
        schedule.setDepartureTime(request.getDepartureTime());
        schedule.setArrivalTime(request.getArrivalTime());
        schedule.setBoardingPoint(request.getBoardingPoint().trim());
        schedule.setDroppingPoint(request.getDroppingPoint().trim());
        schedule.setBaseFare(request.getBaseFare());
        if (request.getStatus() != null) {
            schedule.setStatus(request.getStatus());
        }

        BusSchedule updated = busScheduleRepository.save(schedule);
        long availableSeats = scheduleSeatRepository.countByBusScheduleIdAndStatus(updated.getId(), SeatStatus.AVAILABLE);

        adminAuditService.log(currentAdmin, "SCHEDULE_UPDATED", "BusSchedule", String.valueOf(id), "Updated schedule details");

        return adminMapper.toAdminScheduleResponse(updated, availableSeats);
    }

    @Transactional
    public AdminScheduleResponse updateScheduleStatus(Long id, UpdateScheduleStatusRequest request, Admin currentAdmin) {
        BusSchedule schedule = busScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus schedule not found with id: " + id));

        schedule.setStatus(request.getStatus());
        BusSchedule updated = busScheduleRepository.save(schedule);

        long availableSeats = scheduleSeatRepository.countByBusScheduleIdAndStatus(updated.getId(), SeatStatus.AVAILABLE);
        adminAuditService.log(currentAdmin, "SCHEDULE_STATUS_UPDATED", "BusSchedule", String.valueOf(id), "Updated status to " + request.getStatus());

        return adminMapper.toAdminScheduleResponse(updated, availableSeats);
    }
}
