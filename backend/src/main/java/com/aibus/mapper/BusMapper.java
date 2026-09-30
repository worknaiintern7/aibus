package com.aibus.mapper;

import com.aibus.dto.bus.BoardingPointResponse;
import com.aibus.dto.bus.BusDetailsResponse;
import com.aibus.dto.bus.BusSearchResponse;
import com.aibus.dto.bus.SeatResponse;
import com.aibus.entity.BusSchedule;
import com.aibus.entity.ScheduleSeat;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
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
        response.setBoardingPoint(toBoardingPointResponse(schedule));
        response.setBoardingPoints(toBoardingPoints(schedule));
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
        response.setBoardingPoint(toBoardingPointResponse(schedule));
        response.setBoardingPoints(toBoardingPoints(schedule));
        response.setDroppingPoint(schedule.getDroppingPoint());
        response.setFare(schedule.getBaseFare());
        response.setTotalSeats(schedule.getBus().getTotalSeats());
        response.setAvailableSeatsCount(availableSeatsCount);
        response.setSeats(seats);
        return response;
    }

    public BoardingPointResponse toBoardingPointResponse(BusSchedule schedule) {
        if (schedule == null) return null;
        String name = schedule.getBoardingPoint();
        String source = schedule.getRoute() != null ? schedule.getRoute().getSource() : "";
        String address = schedule.getBoardingPointAddress() != null && !schedule.getBoardingPointAddress().isBlank()
                ? schedule.getBoardingPointAddress()
                : (name != null ? name + (source.isEmpty() ? "" : ", " + source) : "Central Bus Station");
        String landmark = schedule.getBoardingPointLandmark() != null && !schedule.getBoardingPointLandmark().isBlank()
                ? schedule.getBoardingPointLandmark()
                : "Near Main Bus Stand Gate";
        Double latitude = schedule.getBoardingPointLatitude() != null ? schedule.getBoardingPointLatitude() : 18.5308;
        Double longitude = schedule.getBoardingPointLongitude() != null ? schedule.getBoardingPointLongitude() : 73.8475;
        return new BoardingPointResponse("main", name, "08:00 AM", source, address, landmark, latitude, longitude);
    }

    public List<BoardingPointResponse> toBoardingPoints(BusSchedule schedule) {
        if (schedule == null) return List.of();
        String source = schedule.getRoute() != null ? schedule.getRoute().getSource() : "";
        String city = source.trim().toLowerCase();
        List<BoardingPointResponse> list = new ArrayList<>();

        if (city.contains("pune")) {
            list.add(new BoardingPointResponse("pune-1", "Shivajinagar Bus Stand", "08:00 AM", "Central Pune", "Shivajinagar, Pune, Maharashtra 411005", "Near Main Bus Stand Gate, Opp Metro Station", 18.5308, 73.8475));
            list.add(new BoardingPointResponse("pune-2", "Swargate Bus Stand", "07:30 AM", "South Pune", "Jedhe Chowk, Swargate, Pune 411042", "Near Swargate Police Station, Platform 2", 18.5018, 73.8586));
            list.add(new BoardingPointResponse("pune-3", "Wakad / Hinjawadi Bridge", "08:35 AM", "IT Hub & Expressway", "Wakad Flyover, Mumbai-Pune Expressway, Pune 411057", "Under Hinjawadi Flyover, Near Ginger Hotel", 18.5987, 73.7601));
            list.add(new BoardingPointResponse("pune-4", "Nigdi - Pavana Setu", "08:55 AM", "PCMC / North Pune", "Nigdi, Pimpri-Chinchwad, Pune 411044", "Near Pavana Sahakari Bank, Highway Exit", 18.6534, 73.7667));
        } else if (city.contains("mumbai")) {
            list.add(new BoardingPointResponse("mum-1", "Dadar TT Circle Bus Stop", "06:30 AM", "Central Mumbai", "Dadar East, Mumbai, Maharashtra 400014", "Near Swaminarayan Temple, Flyover Pillar 24", 19.0178, 72.8478));
            list.add(new BoardingPointResponse("mum-2", "Sion Circle (Cinemax)", "06:45 AM", "Sion", "Sion East, Mumbai 400022", "Opposite Cinemax Theatre, Under Flyover", 19.0390, 72.8619));
            list.add(new BoardingPointResponse("mum-3", "Vashi Highway Bridge", "07:15 AM", "Navi Mumbai", "Vashi Toll Plaza, Navi Mumbai 400703", "Opposite Center One Mall, Highway Stop", 19.0634, 72.9984));
            list.add(new BoardingPointResponse("mum-4", "Borivali East (National Park)", "06:00 AM", "Western Suburbs", "WEH, Borivali East, Mumbai 400066", "Near Sanjay Gandhi National Park Main Gate", 19.2291, 72.8574));
        } else if (city.contains("nashik")) {
            list.add(new BoardingPointResponse("nsk-1", "CBS Thakkar Bazaar Stand", "07:00 AM", "City Center", "Thakkar Bazaar, Nashik 422002", "Near Main Entrance, Counter No. 3", 19.9975, 73.7898));
            list.add(new BoardingPointResponse("nsk-2", "Dwarka Circle", "07:20 AM", "Dwarka Junction", "Dwarka Circle, Pune-Nashik Highway, Nashik 422011", "Under Dwarka Flyover, Near Hotel Dwarka", 19.9882, 73.8055));
            list.add(new BoardingPointResponse("nsk-3", "Mumbai Naka", "07:35 AM", "Mumbai Naka", "Mumbai Naka, Nashik 422001", "Opposite Hotel Panchavati Yatri", 19.9863, 73.7821));
        } else if (city.contains("goa")) {
            list.add(new BoardingPointResponse("goa-1", "Panjim Kadamba Bus Terminal", "08:00 AM", "Panaji", "Patto Plaza, Panaji, Goa 403001", "Near KTC Central Office Gate", 15.4989, 73.8370));
            list.add(new BoardingPointResponse("goa-2", "Mapusa KTC Bus Stand", "07:30 AM", "North Goa", "Mapusa, Goa 403507", "Near Mapusa Market Entrance", 15.5925, 73.8136));
            list.add(new BoardingPointResponse("goa-3", "Margao Kadamba Terminal", "08:45 AM", "South Goa", "Margao, Goa 403601", "Platform 4, Near RTO Office", 15.2832, 73.9663));
        } else if (city.contains("bengaluru") || city.contains("bangalore")) {
            list.add(new BoardingPointResponse("blr-1", "Majestic Kempegowda Station", "09:00 PM", "Central Bengaluru", "Majestic, Bengaluru 560009", "Opposite Sangam Theatre, Platform 3", 12.9778, 77.5713));
            list.add(new BoardingPointResponse("blr-2", "Madiwala Total Mall", "09:30 PM", "Madiwala", "Madiwala Junction, Bengaluru 560068", "Near St. John's Hospital Junction", 12.9226, 77.6200));
            list.add(new BoardingPointResponse("blr-3", "Electronic City Toll Gate", "09:45 PM", "Electronic City", "Hosur Road, Bengaluru 560100", "Elevated Toll Gate, Pillar 105", 12.8452, 77.6602));
        } else {
            list.add(toBoardingPointResponse(schedule));
        }
        return list;
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
