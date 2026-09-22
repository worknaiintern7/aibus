package com.aibus.controller;

import com.aibus.dto.admin.bus.AdminBusRequest;
import com.aibus.dto.admin.bus.AdminBusResponse;
import com.aibus.dto.admin.bus.AdminSeatRequest;
import com.aibus.dto.bus.SeatResponse;
import com.aibus.dto.common.ApiResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Admin;
import com.aibus.service.AdminBusService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/buses")
public class AdminBusController {

    private final AdminBusService adminBusService;

    public AdminBusController(AdminBusService adminBusService) {
        this.adminBusService = adminBusService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminBusResponse>>> getBuses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<AdminBusResponse> response = adminBusService.getBuses(pageable);
        return ResponseEntity.ok(ApiResponse.success("Buses retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminBusResponse>> getBusById(@PathVariable Long id) {
        AdminBusResponse response = adminBusService.getBusById(id);
        return ResponseEntity.ok(ApiResponse.success("Bus retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminBusResponse>> createBus(
            @Valid @RequestBody AdminBusRequest request,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        AdminBusResponse response = adminBusService.createBus(request, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Bus created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminBusResponse>> updateBus(
            @PathVariable Long id,
            @Valid @RequestBody AdminBusRequest request,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        AdminBusResponse response = adminBusService.updateBus(id, request, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Bus updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminBusResponse>> updateBusStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        boolean active = body.getOrDefault("active", true);
        AdminBusResponse response = adminBusService.updateBusStatus(id, active, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Bus status updated successfully", response));
    }

    @GetMapping("/{busId}/seats")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getBusSeats(@PathVariable Long busId) {
        List<SeatResponse> response = adminBusService.getBusSeats(busId);
        return ResponseEntity.ok(ApiResponse.success("Bus seats layout retrieved successfully", response));
    }

    @PostMapping("/{busId}/seats")
    public ResponseEntity<ApiResponse<SeatResponse>> createBusSeat(
            @PathVariable Long busId,
            @Valid @RequestBody AdminSeatRequest request,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        SeatResponse response = adminBusService.createBusSeat(busId, request, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Bus seat added successfully", response));
    }

    @PutMapping("/{busId}/seats/{seatId}")
    public ResponseEntity<ApiResponse<SeatResponse>> updateBusSeat(
            @PathVariable Long busId,
            @PathVariable Long seatId,
            @Valid @RequestBody AdminSeatRequest request,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        SeatResponse response = adminBusService.updateBusSeat(busId, seatId, request, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Bus seat updated successfully", response));
    }

    @PatchMapping("/{busId}/seats/{seatId}/status")
    public ResponseEntity<ApiResponse<SeatResponse>> updateBusSeatStatus(
            @PathVariable Long busId,
            @PathVariable Long seatId,
            @RequestBody Map<String, Boolean> body,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        boolean active = body.getOrDefault("active", true);
        SeatResponse response = adminBusService.updateBusSeatStatus(busId, seatId, active, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Bus seat status updated successfully", response));
    }
}
