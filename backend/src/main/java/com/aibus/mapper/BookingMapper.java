package com.aibus.mapper;

import com.aibus.dto.booking.BookingDetailsResponse;
import com.aibus.dto.booking.BookingResponse;
import com.aibus.dto.booking.PassengerResponse;
import com.aibus.entity.Booking;
import com.aibus.entity.BookingPassenger;
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
}
