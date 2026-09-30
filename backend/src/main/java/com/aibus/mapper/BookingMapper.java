package com.aibus.mapper;

import com.aibus.dto.booking.BookingDetailsResponse;
import com.aibus.dto.booking.BookingResponse;
import com.aibus.dto.booking.PassengerResponse;
import com.aibus.entity.Booking;
import com.aibus.entity.BookingPassenger;
import com.aibus.entity.GdsBooking;
import com.aibus.entity.GdsBookingPassenger;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BookingMapper {

    private final UserMapper userMapper;

    public BookingMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public BookingResponse toBookingResponse(Booking booking, List<BookingPassenger> passengers) {
        if (booking == null) return null;
        BookingResponse response = new BookingResponse();
        response.setBookingReference(booking.getBookingReference());
        response.setStatus(booking.getStatus());
        response.setTotalAmount(booking.getTotalAmount());
        response.setCreatedAt(booking.getCreatedAt());

        List<PassengerResponse> passengerResponses = passengers.stream()
                .map(p -> new PassengerResponse(p.getName(), p.getAge(), p.getGender(), p.getSeatNumber(), p.getMobile()))
                .collect(Collectors.toList());
        response.setPassengers(passengerResponses);

        List<String> seats = passengers.stream()
                .map(BookingPassenger::getSeatNumber)
                .collect(Collectors.toList());
        response.setSelectedSeats(seats);

        return response;
    }

    public BookingDetailsResponse toBookingDetailsResponse(Booking booking, List<BookingPassenger> passengers) {
        if (booking == null) return null;
        BookingDetailsResponse response = new BookingDetailsResponse();
        response.setBookingReference(booking.getBookingReference());
        response.setBookingStatus(booking.getStatus());
        response.setUser(userMapper.toUserResponse(booking.getUser()));
        response.setBusName(booking.getBusSchedule().getBus().getBusName());
        response.setBusNumber(booking.getBusSchedule().getBus().getBusNumber());
        response.setBusType(booking.getBusSchedule().getBus().getBusType());
        response.setSource(booking.getBusSchedule().getRoute().getSource());
        response.setDestination(booking.getBusSchedule().getRoute().getDestination());
        response.setJourneyDate(booking.getBusSchedule().getJourneyDate());
        response.setDepartureTime(booking.getBusSchedule().getDepartureTime());
        response.setArrivalTime(booking.getBusSchedule().getArrivalTime());
        response.setBoardingPoint(booking.getBusSchedule().getBoardingPoint());
        response.setDroppingPoint(booking.getBusSchedule().getDroppingPoint());
        response.setTotalAmount(booking.getTotalAmount());
        response.setCreatedAt(booking.getCreatedAt());

        List<PassengerResponse> passengerResponses = passengers.stream()
                .map(p -> new PassengerResponse(p.getName(), p.getAge(), p.getGender(), p.getSeatNumber(), p.getMobile()))
                .collect(Collectors.toList());
        response.setPassengers(passengerResponses);

        List<String> seats = passengers.stream()
                .map(BookingPassenger::getSeatNumber)
                .collect(Collectors.toList());
        response.setSelectedSeats(seats);

        return response;
    }

    /**
     * A GDS booking in the same shape as a local one, plus the operator PNR and ticket number.
     */
    public BookingDetailsResponse toBookingDetailsResponse(GdsBooking booking, List<GdsBookingPassenger> passengers) {
        if (booking == null) return null;
        BookingDetailsResponse response = new BookingDetailsResponse();
        response.setProvider("GDS");
        response.setBookingReference(booking.getBookingReference());
        response.setBookingStatus(booking.getStatus());
        response.setUser(userMapper.toUserResponse(booking.getUser()));
        response.setBusName(booking.getBusName());
        response.setBusNumber(booking.getBusNumber());
        response.setBusType(booking.getBusType());
        response.setSource(booking.getSource());
        response.setDestination(booking.getDestination());
        response.setJourneyDate(booking.getJourneyDate());
        response.setDepartureTime(booking.getDepartureTime());
        response.setArrivalTime(booking.getArrivalTime());
        response.setBoardingPoint(booking.getPickupName());
        response.setBoardingTime(booking.getPickupTime());
        response.setDroppingPoint(booking.getDropoffName());
        response.setTotalAmount(booking.getTotalAmount());
        response.setCreatedAt(booking.getCreatedAt());
        response.setPnrNo(booking.getPnrNo());
        response.setTicketNo(booking.getTicketNo());
        response.setContactMobile(booking.getContactMobile());
        response.setContactEmail(booking.getContactEmail());
        response.setRefundAmount(booking.getRefundAmount());
        response.setCancellationCharge(booking.getCancellationCharge());

        List<PassengerResponse> passengerResponses = passengers.stream()
                .map(p -> new PassengerResponse(p.getName(), p.getAge(), p.getGender(), p.getSeatNumber(), booking.getContactMobile()))
                .collect(Collectors.toList());
        response.setPassengers(passengerResponses);

        List<String> seats = passengers.stream()
                .map(GdsBookingPassenger::getSeatNumber)
                .collect(Collectors.toList());
        response.setSelectedSeats(seats);

        return response;
    }
}
