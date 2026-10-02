package com.aibus.service;

import com.aibus.dto.admin.dashboard.AdminDashboardResponse;
import com.aibus.entity.BookingStatus;
import com.aibus.repository.*;
import com.aibus.service.gds.GdsApiService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final GdsBookingRepository gdsBookingRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final BusScheduleRepository busScheduleRepository;
    private final GdsApiService gdsApiService;

    public AdminDashboardService(UserRepository userRepository,
                                 BookingRepository bookingRepository,
                                 GdsBookingRepository gdsBookingRepository,
                                 BusRepository busRepository,
                                 RouteRepository routeRepository,
                                 BusScheduleRepository busScheduleRepository,
                                 GdsApiService gdsApiService) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.gdsBookingRepository = gdsBookingRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.busScheduleRepository = busScheduleRepository;
        this.gdsApiService = gdsApiService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setTotalUsers(userRepository.count());
        response.setActiveUsers(userRepository.countByActiveTrue());

        long localBookings = bookingRepository.count();
        long gdsBookings = gdsBookingRepository.count();
        long localConfirmed = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long gdsConfirmed = gdsBookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long localCancelled = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        long gdsCancelled = gdsBookingRepository.countByStatus(BookingStatus.CANCELLED);

        response.setTotalBookings(localBookings + gdsBookings);
        response.setConfirmedBookings(localConfirmed + gdsConfirmed);
        response.setCancelledBookings(localCancelled + gdsCancelled);
        response.setLocalBookingsCount(localBookings);
        response.setGdsBookingsCount(gdsBookings);

        response.setTotalBuses(busRepository.count());
        response.setActiveBuses(busRepository.countByActiveTrue());

        response.setTotalRoutes(routeRepository.count());
        response.setUpcomingSchedules(busScheduleRepository.countByJourneyDateGreaterThanEqual(LocalDate.now()));

        BigDecimal localRevenue = bookingRepository.calculateTotalRevenue();
        if (localRevenue == null) localRevenue = BigDecimal.ZERO;
        BigDecimal gdsRevenue = gdsBookingRepository.calculateTotalRevenueByStatus(BookingStatus.CONFIRMED);
        if (gdsRevenue == null) gdsRevenue = BigDecimal.ZERO;
        response.setTotalRevenue(localRevenue.add(gdsRevenue));

        boolean apiOk = gdsApiService.isConfigured();
        response.setApiConnected(apiOk);
        if (apiOk) {
            try {
                Map<String, Object> bal = gdsApiService.getAgentBalance();
                if (bal != null && bal.get("Balance") != null) {
                    response.setGdsBalance(new BigDecimal(bal.get("Balance").toString()));
                }
            } catch (Exception ignored) {
            }
        }

        return response;
    }
}
