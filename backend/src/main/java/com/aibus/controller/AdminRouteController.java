package com.aibus.controller;

import com.aibus.dto.admin.route.AdminRouteRequest;
import com.aibus.dto.admin.route.AdminRouteResponse;
import com.aibus.dto.common.ApiResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Admin;
import com.aibus.service.AdminRouteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/routes")
public class AdminRouteController {

    private final AdminRouteService adminRouteService;

    public AdminRouteController(AdminRouteService adminRouteService) {
        this.adminRouteService = adminRouteService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminRouteResponse>>> getRoutes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<AdminRouteResponse> response = adminRouteService.getRoutes(pageable);
        return ResponseEntity.ok(ApiResponse.success("Routes retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRouteResponse>> getRouteById(@PathVariable Long id) {
        AdminRouteResponse response = adminRouteService.getRouteById(id);
        return ResponseEntity.ok(ApiResponse.success("Route details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminRouteResponse>> createRoute(
            @Valid @RequestBody AdminRouteRequest request,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        AdminRouteResponse response = adminRouteService.createRoute(request, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Route created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRouteResponse>> updateRoute(
            @PathVariable Long id,
            @Valid @RequestBody AdminRouteRequest request,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        AdminRouteResponse response = adminRouteService.updateRoute(id, request, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Route updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminRouteResponse>> updateRouteStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            HttpServletRequest httpServletRequest) {
        Admin currentAdmin = (Admin) httpServletRequest.getAttribute("currentAdmin");
        boolean active = body.getOrDefault("active", true);
        AdminRouteResponse response = adminRouteService.updateRouteStatus(id, active, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Route status updated successfully", response));
    }
}
