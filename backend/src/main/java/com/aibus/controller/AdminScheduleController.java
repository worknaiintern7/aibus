package com.aibus.controller;

import com.aibus.dto.admin.schedule.AdminScheduleRequest;
import com.aibus.dto.admin.schedule.AdminScheduleResponse;
import com.aibus.dto.admin.schedule.UpdateScheduleStatusRequest;
import com.aibus.dto.common.ApiResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Admin;
import com.aibus.service.AdminScheduleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/schedules")
public class AdminScheduleController {

    private final AdminScheduleService adminScheduleService;

    public AdminScheduleController(AdminScheduleService adminScheduleService) {
        this.adminScheduleService = adminScheduleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminScheduleResponse>>> getSchedules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<AdminScheduleResponse> response = adminScheduleService.getSchedules(pageable);
        return ResponseEntity.ok(ApiResponse.success("Schedules retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminScheduleResponse>> getScheduleById(@PathVariable Long id) {
        AdminScheduleResponse response = adminScheduleService.getScheduleById(id);
        return ResponseEntity.ok(ApiResponse.success("Schedule details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminScheduleResponse>> createSchedule(
            @Valid @RequestBody AdminScheduleRequest request,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        AdminScheduleResponse response = adminScheduleService.createSchedule(request, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Schedule created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminScheduleResponse>> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody AdminScheduleRequest request,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        AdminScheduleResponse response = adminScheduleService.updateSchedule(id, request, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Schedule updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminScheduleResponse>> updateScheduleStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateScheduleStatusRequest request,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        AdminScheduleResponse response = adminScheduleService.updateScheduleStatus(id, request, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Schedule status updated successfully", response));
    }
}
