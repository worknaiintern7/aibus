package com.aibus.mapper;

import com.aibus.dto.bus.BusDetailsResponse;
import com.aibus.dto.bus.BusSearchResponse;
import com.aibus.dto.bus.SeatResponse;
import com.aibus.entity.BusSchedule;
import com.aibus.entity.ScheduleSeat;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BusMapper {

    public BusSearchResponse toBusSearchResponse(BusSchedule schedule, long availableSeatsCount) {
        if (schedule == null) return null;
        BusSearchResponse response = new BusSearchResponse();
        response.setScheduleId(schedule.getId());
        response.setBusId(schedule.getBus().getId());
        response.setBusName(schedule.getBus().getBusName());
        response.setBusNumber(schedule.getBus().getBusNumber());
        response.setBusType(schedule.getBus().getBusType());
        response.setSource(schedule.getRoute().getSource());
        response.setDestination(schedule.getRoute().getDestination());
        response.setJourneyDate(schedule.getJourneyDate());
        response.setDepartureTime(schedule.getDepartureTime());
        response.setArrivalTime(schedule.getArrivalTime());
        response.setBoardingPoint(schedule.getBoardingPoint());
        response.setDroppingPoint(schedule.getDroppingPoint());
        response.setFare(schedule.getBaseFare());
        response.setAvailableSeats(availableSeatsCount);
        return response;
    }

    public BusDetailsResponse toBusDetailsResponse(BusSchedule schedule, long availableSeatsCount, List<SeatResponse> seats) {
        if (schedule == null) return null;
        BusDetailsResponse response = new BusDetailsResponse();
        response.setScheduleId(schedule.getId());
        response.setBusId(schedule.getBus().getId());
        response.setBusName(schedule.getBus().getBusName());
        response.setBusNumber(schedule.getBus().getBusNumber());
        response.setBusType(schedule.getBus().getBusType());
        response.setSource(schedule.getRoute().getSource());
        response.setDestination(schedule.getRoute().getDestination());
        response.setJourneyDate(schedule.getJourneyDate());
        response.setDepartureTime(schedule.getDepartureTime());
        response.setArrivalTime(schedule.getArrivalTime());
        response.setBoardingPoint(schedule.getBoardingPoint());
        response.setDroppingPoint(schedule.getDroppingPoint());
        response.setFare(schedule.getBaseFare());
        response.setTotalSeats(schedule.getBus().getTotalSeats());
        response.setAvailableSeatsCount(availableSeatsCount);
        response.setSeats(seats);
        return response;
    }

    public SeatResponse toSeatResponse(ScheduleSeat scheduleSeat) {
        if (scheduleSeat == null) return null;
        return new SeatResponse(
                scheduleSeat.getSeat().getSeatNumber(),
                scheduleSeat.getSeat().getSeatType(),
                scheduleSeat.getStatus(),
                scheduleSeat.getSeat().getRowNumber(),
                scheduleSeat.getSeat().getColumnNumber()
        );
    }
}
