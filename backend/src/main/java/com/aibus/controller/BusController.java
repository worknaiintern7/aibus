package com.aibus.controller;

import com.aibus.dto.bus.BusDetailsResponse;
import com.aibus.dto.bus.BusSearchResponse;
import com.aibus.dto.bus.SeatResponse;
import com.aibus.dto.common.ApiResponse;
import com.aibus.service.BusService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BusSearchResponse>>> searchBuses(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<BusSearchResponse> response = busService.searchBuses(source, destination, date);
        return ResponseEntity.ok(ApiResponse.success("Buses retrieved successfully", response));
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<BusDetailsResponse>> getBusDetails(@PathVariable Long scheduleId) {
        BusDetailsResponse response = busService.getBusDetails(scheduleId);
        return ResponseEntity.ok(ApiResponse.success("Bus details retrieved successfully", response));
    }

    @GetMapping("/{scheduleId}/seats")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getSeatAvailability(@PathVariable Long scheduleId) {
        List<SeatResponse> response = busService.getSeatAvailability(scheduleId);
        return ResponseEntity.ok(ApiResponse.success("Seat layout retrieved successfully", response));
    }
}
