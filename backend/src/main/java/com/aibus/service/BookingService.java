package com.aibus.service;

import com.aibus.dto.booking.*;
import com.aibus.entity.*;
import com.aibus.exception.BookingException;
import com.aibus.exception.InvalidBookingException;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.exception.SeatUnavailableException;
import com.aibus.mapper.BookingMapper;
import com.aibus.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final UserRepository userRepository;
    private final BusScheduleRepository busScheduleRepository;
    private final ScheduleSeatRepository scheduleSeatRepository;
    private final BookingRepository bookingRepository;
    private final BookingPassengerRepository bookingPassengerRepository;
    private final PaymentService paymentService;
    private final BookingMapper bookingMapper;

    public BookingService(UserRepository userRepository,
                          BusScheduleRepository busScheduleRepository,
                          ScheduleSeatRepository scheduleSeatRepository,
                          BookingRepository bookingRepository,
                          BookingPassengerRepository bookingPassengerRepository,
                          PaymentService paymentService,
                          BookingMapper bookingMapper) {
        this.userRepository = userRepository;
        this.busScheduleRepository = busScheduleRepository;
        this.scheduleSeatRepository = scheduleSeatRepository;
        this.bookingRepository = bookingRepository;
        this.bookingPassengerRepository = bookingPassengerRepository;
        this.paymentService = paymentService;
        this.bookingMapper = bookingMapper;
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        BusSchedule schedule = busScheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus schedule not found with id: " + request.getScheduleId()));

        if (request.getSelectedSeats().size() != request.getPassengers().size()) {
            throw new BookingException("Number of selected seats must match the number of passengers");
        }

        // Lock seats for update to prevent concurrent duplicate seat bookings
        List<ScheduleSeat> lockedSeats = scheduleSeatRepository.findSeatsForBookingForUpdate(
                schedule.getId(), request.getSelectedSeats()
        );

        Map<String, ScheduleSeat> seatMap = lockedSeats.stream()
                .collect(Collectors.toMap(ss -> ss.getSeat().getSeatNumber(), ss -> ss));

        for (String seatNo : request.getSelectedSeats()) {
            ScheduleSeat scheduleSeat = seatMap.get(seatNo);
            if (scheduleSeat == null || scheduleSeat.getStatus() != SeatStatus.AVAILABLE) {
                throw new SeatUnavailableException("Selected seat " + seatNo + " is no longer available");
            }
        }

        // Calculate total amount on backend (Seats count * Base fare)
        BigDecimal totalAmount = schedule.getBaseFare().multiply(new BigDecimal(request.getSelectedSeats().size()));

        String bookingRef = generateBookingReference();

        Booking booking = new Booking();
        booking.setBookingReference(bookingRef);
        booking.setUser(user);
        booking.setBusSchedule(schedule);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking savedBooking = bookingRepository.save(booking);

        // Save passengers & update seat statuses to BOOKED
        List<BookingPassenger> passengers = new ArrayList<>();
        for (PassengerRequest pReq : request.getPassengers()) {
            BookingPassenger passenger = new BookingPassenger(
                    savedBooking,
                    pReq.getName(),
                    pReq.getAge(),
                    pReq.getGender(),
                    pReq.getSeatNumber(),
                    pReq.getMobile()
            );
            passengers.add(bookingPassengerRepository.save(passenger));

            ScheduleSeat ss = seatMap.get(pReq.getSeatNumber());
            ss.setStatus(SeatStatus.BOOKED);
            ss.setBooking(savedBooking);
            scheduleSeatRepository.save(ss);
        }

        // Process mock payment internally
        paymentService.processMockPayment(savedBooking);

        return bookingMapper.toBookingResponse(savedBooking, passengers);
    }

    @Transactional(readOnly = true)
    public BookingDetailsResponse getBookingDetails(String bookingReference) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + bookingReference));

        List<BookingPassenger> passengers = bookingPassengerRepository.findByBookingId(booking.getId());
        return bookingMapper.toBookingDetailsResponse(booking, passengers);
    }

    @Transactional(readOnly = true)
    public List<BookingDetailsResponse> getUserBookings(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return bookings.stream().map(b -> {
            List<BookingPassenger> passengers = bookingPassengerRepository.findByBookingId(b.getId());
            return bookingMapper.toBookingDetailsResponse(b, passengers);
        }).collect(Collectors.toList());
    }

    @Transactional
    public CancelBookingResponse cancelBooking(String bookingReference) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + bookingReference));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.FAILED) {
            throw new InvalidBookingException("Failed booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Release schedule seats back to AVAILABLE
        List<ScheduleSeat> scheduleSeats = scheduleSeatRepository.findByBusScheduleId(booking.getBusSchedule().getId());
        for (ScheduleSeat ss : scheduleSeats) {
            if (ss.getBooking() != null && ss.getBooking().getId().equals(booking.getId())) {
                ss.setStatus(SeatStatus.AVAILABLE);
                ss.setBooking(null);
                scheduleSeatRepository.save(ss);
            }
        }

        paymentService.processMockRefund(booking);

        return new CancelBookingResponse(
                bookingReference,
                BookingStatus.CANCELLED,
                "Booking cancelled successfully. Seats released."
        );
    }

    private String generateBookingReference() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%06d", new Random().nextInt(1000000));
        return "AIBUS-" + dateStr + "-" + randomStr;
    }
}
