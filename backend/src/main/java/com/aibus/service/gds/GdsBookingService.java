package com.aibus.service.gds;

import com.aibus.dto.booking.BookingDetailsResponse;
import com.aibus.dto.booking.CancelBookingResponse;
import com.aibus.dto.booking.CancellationQuoteResponse;
import com.aibus.dto.booking.GdsHoldRequest;
import com.aibus.dto.booking.PassengerRequest;
import com.aibus.dto.bus.BoardingPointResponse;
import com.aibus.dto.bus.GdsBusDetailsResponse;
import com.aibus.dto.bus.GdsSeatResponse;
import com.aibus.dto.gds.GdsBookData;
import com.aibus.dto.gds.GdsBookingStatusData;
import com.aibus.dto.gds.GdsCancelData;
import com.aibus.dto.gds.GdsCancellableData;
import com.aibus.entity.BookingStatus;
import com.aibus.entity.GdsBooking;
import com.aibus.entity.GdsBookingPassenger;
import com.aibus.entity.User;
import com.aibus.exception.BookingException;
import com.aibus.exception.InvalidBookingException;
import com.aibus.exception.InvalidRequestException;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.exception.SeatUnavailableException;
import com.aibus.mapper.BookingMapper;
import com.aibus.repository.GdsBookingPassengerRepository;
import com.aibus.repository.GdsBookingRepository;
import com.aibus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Bookings on live GDS buses: hold seats, book them, check and cancel.
 */
@Service
public class GdsBookingService {

    private static final Logger log = LoggerFactory.getLogger(GdsBookingService.class);

    private final GdsApiService gdsApiService;
    private final GdsBusService gdsBusService;
    private final GdsBookingRepository gdsBookingRepository;
    private final GdsBookingPassengerRepository gdsBookingPassengerRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    public GdsBookingService(GdsApiService gdsApiService,
                             GdsBusService gdsBusService,
                             GdsBookingRepository gdsBookingRepository,
                             GdsBookingPassengerRepository gdsBookingPassengerRepository,
                             UserRepository userRepository,
                             BookingMapper bookingMapper) {
        this.gdsApiService = gdsApiService;
        this.gdsBusService = gdsBusService;
        this.gdsBookingRepository = gdsBookingRepository;
        this.gdsBookingPassengerRepository = gdsBookingPassengerRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
    }

    /**
     * Step 1: hold the seats with the provider. Seat fares and availability are
     * read again from the live chart, client-supplied amounts are never trusted.
     */
    public BookingDetailsResponse holdSeats(GdsHoldRequest request) {
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        }

        GdsBusService.GdsTrip trip = gdsBusService.loadTrip(
                request.getSource(), request.getDestination(), request.getJourneyDate(), request.getBusId());
        GdsBusDetailsResponse bus = trip.details();

        if (request.getPassengers().size() > bus.getMaxSeatsPerBooking()) {
            throw new BookingException("You can book up to " + bus.getMaxSeatsPerBooking() + " seats in one booking");
        }

        BoardingPointResponse pickup = findPoint(bus.getBoardingPoints(), request.getPickupId())
                .orElseThrow(() -> new InvalidRequestException("Selected boarding point is not valid for this bus"));
        BoardingPointResponse dropoff = findPoint(bus.getDroppingPoints(), request.getDropoffId())
                .orElseThrow(() -> new InvalidRequestException("Selected dropping point is not valid for this bus"));

        Map<String, GdsSeatResponse> seatsByNumber = bus.getDecks().stream()
                .flatMap(deck -> deck.getSeats().stream())
                .collect(Collectors.toMap(GdsSeatResponse::getSeatNumber, seat -> seat, (first, second) -> first));

        GdsBooking booking = new GdsBooking();
        List<Map<String, Object>> gdsPassengers = new ArrayList<>();
        Set<String> usedSeats = new HashSet<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PassengerRequest passenger : request.getPassengers()) {
            String seatNo = passenger.getSeatNumber();
            GdsSeatResponse seat = seatsByNumber.get(seatNo);
            if (seat == null || !"AVAILABLE".equals(seat.getStatus()) || seat.getFare() == null) {
                throw new SeatUnavailableException("Selected seat " + seatNo + " is no longer available");
            }
            if (!usedSeats.add(seatNo)) {
                throw new BookingException("Seat " + seatNo + " is selected more than once");
            }

            String gender = toGdsGender(passenger.getGender());
            if ("FEMALE".equals(seat.getReservedFor()) && !"F".equals(gender)) {
                throw new BookingException("Seat " + seatNo + " is reserved for female passengers");
            }
            if ("MALE".equals(seat.getReservedFor()) && !"M".equals(gender)) {
                throw new BookingException("Seat " + seatNo + " is reserved for male passengers");
            }

            Map<String, Object> gdsPassenger = new LinkedHashMap<>();
            gdsPassenger.put("Name", passenger.getName().trim());
            gdsPassenger.put("Age", passenger.getAge());
            gdsPassenger.put("Gender", gender);
            gdsPassenger.put("SeatNo", seatNo);
            gdsPassenger.put("Fare", seat.getFare());
            gdsPassenger.put("SeatTypeId", seat.getSeatTypeId());
            gdsPassenger.put("IsAcSeat", trip.acBus());
            gdsPassengers.add(gdsPassenger);

            booking.getPassengers().add(new GdsBookingPassenger(
                    booking, passenger.getName().trim(), passenger.getAge(), passenger.getGender(), seatNo, seat.getFare()));
            totalAmount = totalAmount.add(seat.getFare());
        }

        String contactEmail = request.getContactEmail() == null ? "" : request.getContactEmail().trim();

        Map<String, Object> contactInfo = new LinkedHashMap<>();
        contactInfo.put("CustomerName", request.getPassengers().get(0).getName().trim());
        contactInfo.put("Email", contactEmail);
        contactInfo.put("Phone", request.getContactMobile());
        contactInfo.put("Mobile", request.getContactMobile());

        Map<String, Object> holdRequest = new LinkedHashMap<>();
        holdRequest.put("FromCityId", trip.fromCityId());
        holdRequest.put("ToCityId", trip.toCityId());
        holdRequest.put("JourneyDate", request.getJourneyDate().toString());
        holdRequest.put("BusId", request.getBusId());
        holdRequest.put("PickUpID", pickup.getId());
        holdRequest.put("DropOffID", dropoff.getId());
        holdRequest.put("ContactInfo", contactInfo);
        holdRequest.put("Passengers", gdsPassengers);

        long holdId = gdsApiService.holdSeats(holdRequest);

        booking.setBookingReference(generateBookingReference());
        booking.setUser(user);
        booking.setContactMobile(request.getContactMobile());
        booking.setContactEmail(contactEmail.isEmpty() ? null : contactEmail);
        booking.setFromCityId(trip.fromCityId());
        booking.setToCityId(trip.toCityId());
        booking.setSource(request.getSource());
        booking.setDestination(request.getDestination());
        booking.setJourneyDate(request.getJourneyDate());
        booking.setGdsBusId(request.getBusId());
        booking.setBusName(bus.getBusName());
        booking.setBusNumber(bus.getBusNumber());
        booking.setBusType(bus.getBusType());
        booking.setDepartureTime(bus.getDepartureTime());
        booking.setArrivalTime(bus.getArrivalTime());
        booking.setPickupId(pickup.getId());
        booking.setPickupName(pickup.getName());
        booking.setPickupTime(pickup.getTime());
        booking.setDropoffId(dropoff.getId());
        booking.setDropoffName(dropoff.getName());
        booking.setHoldId(holdId);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.PENDING);

        GdsBooking saved = gdsBookingRepository.save(booking);
        log.info("GDS seats held: reference={}, holdId={}", saved.getBookingReference(), holdId);

        return toDetails(saved);
    }

    /**
     * Step 2: book the held seats. To be called once the payment is received.
     */
    public BookingDetailsResponse confirmBooking(String bookingReference) {
        GdsBooking booking = findBooking(bookingReference);

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return toDetails(booking);
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("This booking can no longer be confirmed");
        }

        try {
            GdsBookData booked = gdsApiService.bookSeats(booking.getHoldId());
            markConfirmed(booking, booked.getPnrNo(), booked.getTicketNo(), booked.getTotalFare());
        } catch (RuntimeException ex) {
            // No clear answer from BookSeats: ask the provider what happened to this hold.
            log.warn("GDS BookSeats failed for {} (holdId={}): {}", bookingReference, booking.getHoldId(), ex.getMessage());
            reconcileAfterFailedBooking(booking, ex);
        }

        GdsBooking saved = gdsBookingRepository.save(booking);
        log.info("GDS booking confirmed: reference={}, pnr={}, ticketNo={}",
                saved.getBookingReference(), saved.getPnrNo(), saved.getTicketNo());
        return toDetails(saved);
    }

    private void reconcileAfterFailedBooking(GdsBooking booking, RuntimeException bookingError) {
        GdsBookingStatusData status;
        try {
            status = gdsApiService.getBookingStatus(booking.getHoldId());
        } catch (RuntimeException statusError) {
            // Still unknown. The booking stays PENDING so it can be confirmed again.
            throw new BookingException("We could not confirm your booking with the bus operator. "
                    + "Please try again in a moment. Reference: " + booking.getBookingReference());
        }

        if (status.getStatus() == GdsBookingStatusData.BOOKED) {
            markConfirmed(booking, status.getPnrNo(), status.getTicketNo(), null);
            return;
        }
        if (status.getStatus() == GdsBookingStatusData.IN_PROGRESS) {
            throw new BookingException("Your booking is still being processed by the bus operator. "
                    + "Please check again in a moment. Reference: " + booking.getBookingReference());
        }

        booking.setStatus(BookingStatus.FAILED);
        gdsBookingRepository.save(booking);
        throw new BookingException("Booking failed: " + bookingError.getMessage());
    }

    private void markConfirmed(GdsBooking booking, String pnrNo, String ticketNo, BigDecimal totalFare) {
        booking.setPnrNo(pnrNo);
        booking.setTicketNo(ticketNo);
        if (totalFare != null && totalFare.signum() > 0) {
            booking.setTotalAmount(totalFare);
        }
        booking.setStatus(BookingStatus.CONFIRMED);
    }

    /**
     * Refund the customer would get if the ticket is cancelled right now.
     */
    public CancellationQuoteResponse getCancellationQuote(String bookingReference) {
        GdsBooking booking = findBooking(bookingReference);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            return new CancellationQuoteResponse(bookingReference, false, booking.getTotalAmount(), null, null);
        }

        GdsCancellableData quote = gdsApiService.isCancellable(
                booking.getPnrNo(), booking.getTicketNo(), seatNumbers(booking));
        return new CancellationQuoteResponse(bookingReference, quote.isCancellable(),
                quote.getTotalFare() != null ? quote.getTotalFare() : booking.getTotalAmount(),
                quote.getChargePct(), quote.getRefundAmount());
    }

    /**
     * Empty when the reference does not belong to a GDS booking.
     */
    public Optional<CancelBookingResponse> cancelBooking(String bookingReference) {
        Optional<GdsBooking> found = gdsBookingRepository.findByBookingReference(bookingReference);
        if (found.isEmpty()) {
            return Optional.empty();
        }
        GdsBooking booking = found.get();

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.FAILED) {
            throw new InvalidBookingException("Failed booking cannot be cancelled");
        }

        // Seats were only held, no ticket was issued: the hold expires on its own.
        if (booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CANCELLED);
            gdsBookingRepository.save(booking);
            return Optional.of(new CancelBookingResponse(bookingReference, BookingStatus.CANCELLED,
                    "Booking cancelled. No ticket had been issued."));
        }

        String seatNos = seatNumbers(booking);
        GdsCancellableData quote = gdsApiService.isCancellable(booking.getPnrNo(), booking.getTicketNo(), seatNos);
        if (!quote.isCancellable()) {
            throw new InvalidBookingException("This ticket can no longer be cancelled as per the operator's policy");
        }

        GdsCancelData cancelled = gdsApiService.cancelSeats(booking.getPnrNo(), booking.getTicketNo(), seatNos);

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setRefundAmount(cancelled.getRefundAmount());
        booking.setCancellationCharge(cancelled.getChargeAmt());
        gdsBookingRepository.save(booking);
        log.info("GDS booking cancelled: reference={}, refund={}", bookingReference, cancelled.getRefundAmount());

        CancelBookingResponse response = new CancelBookingResponse(bookingReference, BookingStatus.CANCELLED,
                "Booking cancelled successfully.");
        response.setRefundAmount(cancelled.getRefundAmount());
        response.setCancellationCharge(cancelled.getChargeAmt());
        return Optional.of(response);
    }

    @Transactional(readOnly = true)
    public Optional<BookingDetailsResponse> findBookingDetails(String bookingReference) {
        return gdsBookingRepository.findByBookingReference(bookingReference).map(this::toDetails);
    }

    @Transactional(readOnly = true)
    public List<BookingDetailsResponse> getUserBookings(Long userId) {
        return gdsBookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDetails)
                .collect(Collectors.toList());
    }

    private GdsBooking findBooking(String bookingReference) {
        return gdsBookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + bookingReference));
    }

    private BookingDetailsResponse toDetails(GdsBooking booking) {
        return bookingMapper.toBookingDetailsResponse(booking, passengersOf(booking));
    }

    private List<GdsBookingPassenger> passengersOf(GdsBooking booking) {
        return gdsBookingPassengerRepository.findByBookingIdOrderByIdAsc(booking.getId());
    }

    // CancelSeats / IsCancellable take a comma separated list, e.g. "LA,LB"
    private String seatNumbers(GdsBooking booking) {
        return passengersOf(booking).stream()
                .map(GdsBookingPassenger::getSeatNumber)
                .collect(Collectors.joining(","));
    }

    private Optional<BoardingPointResponse> findPoint(List<BoardingPointResponse> points, String id) {
        if (points == null || id == null) return Optional.empty();
        return points.stream().filter(point -> id.equals(point.getId())).findFirst();
    }

    // The provider only accepts M or F
    private String toGdsGender(String gender) {
        String value = gender == null ? "" : gender.trim().toUpperCase();
        if (value.equals("M") || value.equals("MALE")) return "M";
        if (value.equals("F") || value.equals("FEMALE")) return "F";
        throw new InvalidRequestException("Passenger gender must be Male or Female for this bus");
    }

    private String generateBookingReference() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%06d", new Random().nextInt(1000000));
        return "AIBUS-" + dateStr + "-" + randomStr;
    }
}
