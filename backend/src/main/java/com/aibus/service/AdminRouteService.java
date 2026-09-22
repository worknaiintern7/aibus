package com.aibus.service;

import com.aibus.dto.admin.route.AdminRouteRequest;
import com.aibus.dto.admin.route.AdminRouteResponse;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Admin;
import com.aibus.entity.Route;
import com.aibus.exception.InvalidRequestException;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.RouteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminRouteService {

    private final RouteRepository routeRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

    public AdminRouteService(RouteRepository routeRepository,
                             AdminMapper adminMapper,
                             AdminAuditService adminAuditService) {
        this.routeRepository = routeRepository;
        this.adminMapper = adminMapper;
        this.adminAuditService = adminAuditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminRouteResponse> getRoutes(Pageable pageable) {
        Page<Route> page = routeRepository.findAll(pageable);
        List<AdminRouteResponse> content = page.getContent().stream()
                .map(adminMapper::toAdminRouteResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Transactional(readOnly = true)
    public AdminRouteResponse getRouteById(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        return adminMapper.toAdminRouteResponse(route);
    }

    @Transactional
    public AdminRouteResponse createRoute(AdminRouteRequest request, Admin currentAdmin) {
        if (routeRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase(request.getSource(), request.getDestination()).isPresent()) {
            throw new InvalidRequestException("Route already exists from " + request.getSource() + " to " + request.getDestination());
        }

        Route route = new Route(request.getSource().trim(), request.getDestination().trim(), request.isActive());
        Route saved = routeRepository.save(route);

        adminAuditService.log(currentAdmin, "ROUTE_CREATED", "Route", String.valueOf(saved.getId()), "Created route " + saved.getSource() + " -> " + saved.getDestination());

        return adminMapper.toAdminRouteResponse(saved);
    }

    @Transactional
    public AdminRouteResponse updateRoute(Long id, AdminRouteRequest request, Admin currentAdmin) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));

        route.setSource(request.getSource().trim());
        route.setDestination(request.getDestination().trim());
        route.setActive(request.isActive());

        Route updated = routeRepository.save(route);
        adminAuditService.log(currentAdmin, "ROUTE_UPDATED", "Route", String.valueOf(id), "Updated route " + updated.getSource() + " -> " + updated.getDestination());

        return adminMapper.toAdminRouteResponse(updated);
    }

    @Transactional
    public AdminRouteResponse updateRouteStatus(Long id, boolean active, Admin currentAdmin) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));

        route.setActive(active);
        Route updated = routeRepository.save(route);

        String action = active ? "ROUTE_ACTIVATED" : "ROUTE_DEACTIVATED";
        adminAuditService.log(currentAdmin, action, "Route", String.valueOf(id), "Set active status to " + active);

        return adminMapper.toAdminRouteResponse(updated);
    }
}
