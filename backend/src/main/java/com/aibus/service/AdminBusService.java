package com.aibus.service;

import com.aibus.dto.admin.bus.AdminBusRequest;
import com.aibus.dto.admin.bus.AdminBusResponse;
import com.aibus.dto.admin.bus.AdminSeatRequest;
import com.aibus.dto.bus.SeatResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.*;
import com.aibus.exception.InvalidRequestException;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.BusRepository;
import com.aibus.repository.SeatRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminBusService {

    private final BusRepository busRepository;
    private final SeatRepository seatRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

    public AdminBusService(BusRepository busRepository,
                           SeatRepository seatRepository,
                           AdminMapper adminMapper,
                           AdminAuditService adminAuditService) {
        this.busRepository = busRepository;
        this.seatRepository = seatRepository;
        this.adminMapper = adminMapper;
        this.adminAuditService = adminAuditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminBusResponse> getBuses(Pageable pageable) {
        Page<Bus> page = busRepository.findAll(pageable);
        List<AdminBusResponse> content = page.getContent().stream()
                .map(adminMapper::toAdminBusResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Transactional(readOnly = true)
    public AdminBusResponse getBusById(Long id) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + id));
        return adminMapper.toAdminBusResponse(bus);
    }

    @Transactional
    public AdminBusResponse createBus(AdminBusRequest request, Admin currentAdmin) {
        if (busRepository.findByBusNumber(request.getBusNumber()).isPresent()) {
            throw new InvalidRequestException("Bus number already exists: " + request.getBusNumber());
        }

        Bus bus = new Bus();
        bus.setBusNumber(request.getBusNumber().toUpperCase().trim());
        bus.setBusName(request.getBusName().trim());
        bus.setBusType(request.getBusType());
        bus.setTotalSeats(request.getTotalSeats());
        bus.setActive(request.isActive());

        Bus savedBus = busRepository.save(bus);
        adminAuditService.log(currentAdmin, "BUS_CREATED", "Bus", String.valueOf(savedBus.getId()), "Created bus " + savedBus.getBusNumber());

        return adminMapper.toAdminBusResponse(savedBus);
    }

    @Transactional
    public AdminBusResponse updateBus(Long id, AdminBusRequest request, Admin currentAdmin) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + id));

        bus.setBusName(request.getBusName().trim());
        bus.setBusType(request.getBusType());
        bus.setTotalSeats(request.getTotalSeats());
        bus.setActive(request.isActive());

        Bus updated = busRepository.save(bus);
        adminAuditService.log(currentAdmin, "BUS_UPDATED", "Bus", String.valueOf(id), "Updated bus details for " + updated.getBusNumber());

        return adminMapper.toAdminBusResponse(updated);
    }

    @Transactional
    public AdminBusResponse updateBusStatus(Long id, boolean active, Admin currentAdmin) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + id));

        bus.setActive(active);
        Bus updated = busRepository.save(bus);

        String action = active ? "BUS_ACTIVATED" : "BUS_DEACTIVATED";
        adminAuditService.log(currentAdmin, action, "Bus", String.valueOf(id), "Updated active status to " + active);

        return adminMapper.toAdminBusResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getBusSeats(Long busId) {
        if (!busRepository.existsById(busId)) {
            throw new ResourceNotFoundException("Bus not found with id: " + busId);
        }
        List<Seat> seats = seatRepository.findByBusIdOrderByRowNumberAscColumnNumberAsc(busId);
        return seats.stream().map(s -> new SeatResponse(
                s.getSeatNumber(),
                s.getSeatType(),
                s.isActive() ? SeatStatus.AVAILABLE : SeatStatus.BLOCKED,
                s.getRowNumber(),
                s.getColumnNumber()
        )).collect(Collectors.toList());
    }

    @Transactional
    public SeatResponse createBusSeat(Long busId, AdminSeatRequest request, Admin currentAdmin) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + busId));

        Seat seat = new Seat(bus, request.getSeatNumber(), request.getSeatType(), request.getRowNumber(), request.getColumnNumber(), request.isActive());
        Seat saved = seatRepository.save(seat);
        adminAuditService.log(currentAdmin, "SEAT_CREATED", "Seat", String.valueOf(saved.getId()), "Added seat " + request.getSeatNumber() + " to bus " + bus.getBusNumber());

        return new SeatResponse(saved.getSeatNumber(), saved.getSeatType(), saved.isActive() ? SeatStatus.AVAILABLE : SeatStatus.BLOCKED, saved.getRowNumber(), saved.getColumnNumber());
    }

    @Transactional
    public SeatResponse updateBusSeat(Long busId, Long seatId, AdminSeatRequest request, Admin currentAdmin) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + seatId));

        seat.setSeatNumber(request.getSeatNumber());
        seat.setSeatType(request.getSeatType());
        seat.setRowNumber(request.getRowNumber());
        seat.setColumnNumber(request.getColumnNumber());
        seat.setActive(request.isActive());

        Seat updated = seatRepository.save(seat);
        adminAuditService.log(currentAdmin, "SEAT_UPDATED", "Seat", String.valueOf(seatId), "Updated seat " + updated.getSeatNumber());

        return new SeatResponse(updated.getSeatNumber(), updated.getSeatType(), updated.isActive() ? SeatStatus.AVAILABLE : SeatStatus.BLOCKED, updated.getRowNumber(), updated.getColumnNumber());
    }

    @Transactional
    public SeatResponse updateBusSeatStatus(Long busId, Long seatId, boolean active, Admin currentAdmin) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + seatId));

        seat.setActive(active);
        Seat updated = seatRepository.save(seat);
        adminAuditService.log(currentAdmin, "SEAT_STATUS_UPDATED", "Seat", String.valueOf(seatId), "Set active to " + active);

        return new SeatResponse(updated.getSeatNumber(), updated.getSeatType(), updated.isActive() ? SeatStatus.AVAILABLE : SeatStatus.BLOCKED, updated.getRowNumber(), updated.getColumnNumber());
    }
}
