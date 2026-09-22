package com.aibus.config;

import com.aibus.entity.*;
import com.aibus.repository.*;
import com.aibus.util.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final RouteRepository routeRepository;
    private final BusRepository busRepository;
    private final SeatRepository seatRepository;
    private final BusScheduleRepository busScheduleRepository;
    private final ScheduleSeatRepository scheduleSeatRepository;

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      RouteRepository routeRepository,
                      BusRepository busRepository,
                      SeatRepository seatRepository,
                      BusScheduleRepository busScheduleRepository,
                      ScheduleSeatRepository scheduleSeatRepository,
                      AdminRepository adminRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.routeRepository = routeRepository;
        this.busRepository = busRepository;
        this.seatRepository = seatRepository;
        this.busScheduleRepository = busScheduleRepository;
        this.scheduleSeatRepository = scheduleSeatRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdminAccount();
        seedUser();
        List<Route> routes = seedRoutes();
        List<Bus> buses = seedBuses();

        for (Bus bus : buses) {
            seedSeatsForBus(bus);
        }

        seedSchedulesAndScheduleSeats(routes, buses);
    }

    private void seedAdminAccount() {
        if (!adminRepository.existsByEmail("admin@aibus.com")) {
            Admin admin = new Admin();
            admin.setName("AIBus Admin");
            admin.setEmail("admin@aibus.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setActive(true);
            adminRepository.save(admin);
            logger.info("Seeded default development admin account: admin@aibus.com / admin123");
        }
    }

    private void seedUser() {
        if (!userRepository.existsByMobile("9876543210")) {
            User user = new User();
            user.setMobile("9876543210");
            user.setName("AIBus User");
            userRepository.save(user);
            logger.info("Seeded default test user 9876543210");
        }
    }

    private List<Route> seedRoutes() {
        List<Route> routes = new ArrayList<>();
        routes.add(createRouteIfAbsent("Pune", "Mumbai"));
        routes.add(createRouteIfAbsent("Mumbai", "Pune"));
        routes.add(createRouteIfAbsent("Pune", "Nashik"));
        routes.add(createRouteIfAbsent("Nashik", "Pune"));
        routes.add(createRouteIfAbsent("Pune", "Goa"));
        routes.add(createRouteIfAbsent("Mumbai", "Goa"));
        return routes;
    }

    private Route createRouteIfAbsent(String source, String destination) {
        return routeRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase(source, destination)
                .orElseGet(() -> routeRepository.save(new Route(source, destination, true)));
    }

    private List<Bus> seedBuses() {
        List<Bus> buses = new ArrayList<>();
        buses.add(createBusIfAbsent("AI001", "AIBus Express", BusType.AC_SEATER, 20));
        buses.add(createBusIfAbsent("AI002", "AIBus Travels", BusType.NON_AC_SEATER, 20));
        buses.add(createBusIfAbsent("AI003", "AIBus Premium", BusType.AC_SLEEPER, 16));
        return buses;
    }

    private Bus createBusIfAbsent(String busNumber, String busName, BusType busType, int totalSeats) {
        return busRepository.findByBusNumber(busNumber)
                .orElseGet(() -> busRepository.save(new Bus(busNumber, busName, busType, totalSeats, true)));
    }

    private void seedSeatsForBus(Bus bus) {
        List<Seat> existing = seatRepository.findByBusIdOrderByRowNumberAscColumnNumberAsc(bus.getId());
        if (!existing.isEmpty()) {
            return;
        }

        List<Seat> seats = new ArrayList<>();
        if (bus.getBusType() == BusType.AC_SLEEPER) {
            // 16 sleeper seats (L1-L8 Lower, U1-U8 Upper)
            String[] rows = {"L", "U"};
            for (String level : rows) {
                SeatType type = level.equals("L") ? SeatType.LOWER : SeatType.UPPER;
                for (int i = 1; i <= 8; i++) {
                    String seatNo = level + i;
                    SeatType specificType = (i % 2 == 1) ? SeatType.WINDOW : SeatType.AISLE;
                    seats.add(new Seat(bus, seatNo, specificType, level.equals("L") ? 1 : 2, i, true));
                }
            }
        } else {
            // 20 seater seats (A1-A4, B1-B4, C1-C4, D1-D4, E1-E4)
            char[] rows = {'A', 'B', 'C', 'D', 'E'};
            for (int r = 0; r < rows.length; r++) {
                for (int c = 1; c <= 4; c++) {
                    String seatNo = "" + rows[r] + c;
                    SeatType type = (c == 1 || c == 4) ? SeatType.WINDOW : SeatType.AISLE;
                    seats.add(new Seat(bus, seatNo, type, r + 1, c, true));
                }
            }
        }
        seatRepository.saveAll(seats);
        logger.info("Seeded {} seats for bus {}", seats.size(), bus.getBusNumber());
    }

    private void seedSchedulesAndScheduleSeats(List<Route> routes, List<Bus> buses) {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate targetDate = LocalDate.of(2026, 9, 25);

        List<LocalDate> dates = List.of(today, tomorrow, targetDate);

        for (LocalDate date : dates) {
            for (Route route : routes) {
                for (Bus bus : buses) {
                    createScheduleAndSeatsIfAbsent(route, bus, date);
                }
            }
        }
    }

    private void createScheduleAndSeatsIfAbsent(Route route, Bus bus, LocalDate date) {
        // Create 1 schedule per bus & route & date combination if absent
        List<BusSchedule> existing = busScheduleRepository
                .findByRouteSourceIgnoreCaseAndRouteDestinationIgnoreCaseAndJourneyDateAndStatus(
                        route.getSource(), route.getDestination(), date, ScheduleStatus.SCHEDULED
                );

        boolean exists = existing.stream().anyMatch(s -> s.getBus().getId().equals(bus.getId()));
        if (exists) {
            return;
        }

        BusSchedule schedule = new BusSchedule();
        schedule.setBus(bus);
        schedule.setRoute(route);
        schedule.setJourneyDate(date);
        schedule.setDepartureTime(LocalTime.of(8, 0));
        schedule.setArrivalTime(LocalTime.of(12, 0));
        schedule.setBoardingPoint(route.getSource() + " Central Bus Station");
        schedule.setDroppingPoint(route.getDestination() + " Main Bus Stand");
        schedule.setBaseFare(bus.getBusType() == BusType.AC_SLEEPER ? new BigDecimal("850.00") : new BigDecimal("500.00"));
        schedule.setStatus(ScheduleStatus.SCHEDULED);

        BusSchedule savedSchedule = busScheduleRepository.save(schedule);

        List<Seat> busSeats = seatRepository.findByBusIdOrderByRowNumberAscColumnNumberAsc(bus.getId());
        List<ScheduleSeat> scheduleSeats = new ArrayList<>();
        for (Seat seat : busSeats) {
            scheduleSeats.add(new ScheduleSeat(savedSchedule, seat, SeatStatus.AVAILABLE));
        }
        scheduleSeatRepository.saveAll(scheduleSeats);
    }
}
