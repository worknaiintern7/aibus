package com.aibus.config;

import com.aibus.entity.Admin;
import com.aibus.repository.*;
import com.aibus.util.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final RouteRepository routeRepository;
    private final BusRepository busRepository;
    private final SeatRepository seatRepository;
    private final BusScheduleRepository busScheduleRepository;
    private final ScheduleSeatRepository scheduleSeatRepository;
    private final BookingRepository bookingRepository;
    private final BookingPassengerRepository bookingPassengerRepository;
    private final GdsBookingRepository gdsBookingRepository;
    private final GdsBookingPassengerRepository gdsBookingPassengerRepository;
    private final PaymentRepository paymentRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      RouteRepository routeRepository,
                      BusRepository busRepository,
                      SeatRepository seatRepository,
                      BusScheduleRepository busScheduleRepository,
                      ScheduleSeatRepository scheduleSeatRepository,
                      BookingRepository bookingRepository,
                      BookingPassengerRepository bookingPassengerRepository,
                      GdsBookingRepository gdsBookingRepository,
                      GdsBookingPassengerRepository gdsBookingPassengerRepository,
                      PaymentRepository paymentRepository,
                      AdminRepository adminRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.routeRepository = routeRepository;
        this.busRepository = busRepository;
        this.seatRepository = seatRepository;
        this.busScheduleRepository = busScheduleRepository;
        this.scheduleSeatRepository = scheduleSeatRepository;
        this.bookingRepository = bookingRepository;
        this.bookingPassengerRepository = bookingPassengerRepository;
        this.gdsBookingRepository = gdsBookingRepository;
        this.gdsBookingPassengerRepository = gdsBookingPassengerRepository;
        this.paymentRepository = paymentRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdminAccount();
        purgeDummyData();
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
            logger.info("Initialized default admin account: admin@aibus.com / admin123");
        }
    }

    private void purgeDummyData() {
        try {
            logger.info("Purging all dummy and mock data from database...");
            gdsBookingPassengerRepository.deleteAll();
            gdsBookingRepository.deleteAll();
            paymentRepository.deleteAll();
            bookingPassengerRepository.deleteAll();
            bookingRepository.deleteAll();
            scheduleSeatRepository.deleteAll();
            busScheduleRepository.deleteAll();
            seatRepository.deleteAll();
            busRepository.deleteAll();
            routeRepository.deleteAll();
            userRepository.deleteAll();
            logger.info("Database dummy data successfully removed. Only live API data will be displayed.");
        } catch (Exception e) {
            logger.warn("Error while cleaning dummy data: {}", e.getMessage());
        }
    }
}
