package com.aibus.service;

import com.aibus.dto.admin.dashboard.AdminDashboardResponse;
import com.aibus.entity.BookingStatus;
import com.aibus.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final BusScheduleRepository busScheduleRepository;

    public AdminDashboardService(UserRepository userRepository,
                                 BookingRepository bookingRepository,
                                 BusRepository busRepository,
                                 RouteRepository routeRepository,
                                 BusScheduleRepository busScheduleRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.busScheduleRepository = busScheduleRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setTotalUsers(userRepository.count());
        response.setActiveUsers(userRepository.countByActiveTrue());

        response.setTotalBookings(bookingRepository.count());
        response.setConfirmedBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED));
        response.setCancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED));

        response.setTotalBuses(busRepository.count());
        response.setActiveBuses(busRepository.countByActiveTrue());

        response.setTotalRoutes(routeRepository.count());
        response.setUpcomingSchedules(busScheduleRepository.countByJourneyDateGreaterThanEqual(LocalDate.now()));

        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue();
        response.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        return response;
    }
}
