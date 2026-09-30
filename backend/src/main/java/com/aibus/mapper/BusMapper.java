package com.aibus.mapper;

import com.aibus.dto.bus.BoardingPointResponse;
import com.aibus.dto.bus.BusDetailsResponse;
import com.aibus.dto.bus.BusSearchResponse;
import com.aibus.dto.bus.GdsBusDetailsResponse;
import com.aibus.dto.bus.GdsDeckResponse;
import com.aibus.dto.bus.GdsSeatResponse;
import com.aibus.dto.bus.SeatResponse;
import com.aibus.dto.gds.GdsBus;
import com.aibus.dto.gds.GdsBusStatus;
import com.aibus.dto.gds.GdsBusType;
import com.aibus.dto.gds.GdsChartData;
import com.aibus.dto.gds.GdsDropoff;
import com.aibus.dto.gds.GdsPickup;
import com.aibus.entity.BusSchedule;
import com.aibus.entity.BusType;
import com.aibus.entity.ScheduleSeat;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Component
public class BusMapper {

    private static final DateTimeFormatter BOARDING_TIME_FORMAT =
            DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

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

    /**
     * Maps a live GDS bus to the same search DTO the customer app already uses.
     * GDS buses have no local schedule, so scheduleId / busId stay null.
     */
    public BusSearchResponse toBusSearchResponse(GdsBus bus, String source, String destination, LocalDate journeyDate) {
        if (bus == null) return null;
        BusSearchResponse response = new BusSearchResponse();
        fillFromGdsBus(response, bus, source, destination, journeyDate);
        return response;
    }

    /**
     * A live GDS bus together with its seat chart. Pickups, dropoffs and seat
     * availability come from the chart, which is more detailed than the search result.
     */
    public GdsBusDetailsResponse toGdsBusDetailsResponse(GdsBus bus, GdsChartData chart, String source,
                                                         String destination, LocalDate journeyDate) {
        if (bus == null || chart == null) return null;
        GdsBusDetailsResponse response = new GdsBusDetailsResponse();
        fillFromGdsBus(response, bus, source, destination, journeyDate);
        response.setBusLabel(bus.getDisplayBusType() != null && !bus.getDisplayBusType().isBlank()
                ? bus.getDisplayBusType()
                : bus.getBusLabel());

        if (chart.getPickups() != null && !chart.getPickups().isEmpty()) {
            List<BoardingPointResponse> boardingPoints = toBoardingPoints(chart.getPickups(), source);
            response.setBoardingPoints(boardingPoints);
            response.setBoardingPoint(boardingPoints.get(0));
        }

        List<GdsDropoff> dropoffs = chart.getDropoffs() != null ? chart.getDropoffs() : bus.getDropoffs();
        List<BoardingPointResponse> droppingPoints = new ArrayList<>();
        if (dropoffs != null) {
            for (GdsDropoff dropoff : dropoffs) {
                LocalTime dropoffTime = toLocalTime(dropoff.getDropoffTime());
                droppingPoints.add(new BoardingPointResponse(
                        dropoff.getDropoffCode(),
                        dropoff.getDropoffName(),
                        dropoffTime != null ? dropoffTime.format(BOARDING_TIME_FORMAT) : null,
                        destination,
                        dropoff.getDropoffName() + ", " + destination,
                        null,
                        null,
                        null));
            }
        }
        response.setDroppingPoints(droppingPoints);

        List<GdsDeckResponse> decks = toDecks(chart);
        response.setDecks(decks);
        response.setAvailableSeats(decks.stream()
                .flatMap(deck -> deck.getSeats().stream())
                .filter(seat -> "AVAILABLE".equals(seat.getStatus()))
                .count());
        // The search result only knows base fares; the chart has the payable fare per seat.
        decks.stream()
                .flatMap(deck -> deck.getSeats().stream())
                .map(GdsSeatResponse::getFare)
                .filter(fare -> fare != null && fare.signum() > 0)
                .min(Comparator.naturalOrder())
                .ifPresent(response::setFare);

        response.setMaxSeatsPerBooking(chart.getMaxAllowedSeats() != null && chart.getMaxAllowedSeats() > 0
                ? chart.getMaxAllowedSeats()
                : 6);

        List<GdsBusDetailsResponse.CancellationSlab> policy = new ArrayList<>();
        if (chart.getCancellation() != null) {
            for (GdsChartData.CancellationSlab slab : chart.getCancellation()) {
                policy.add(new GdsBusDetailsResponse.CancellationSlab(slab.getMins(), slab.getPct()));
            }
            policy.sort(Comparator.comparingInt(
                    GdsBusDetailsResponse.CancellationSlab::getMinutesBeforeDeparture).reversed());
        }
        response.setCancellationPolicy(policy);
        return response;
    }

    /*
     * Chart layout: each seat is [seq_no, row, col, width, height, seat_type].
     * Seat number, status and fare are looked up by seq_no.
     */
    private List<GdsDeckResponse> toDecks(GdsChartData chart) {
        List<GdsDeckResponse> decks = new ArrayList<>();
        if (chart.getChartLayout() == null || chart.getChartLayout().getLayout() == null) return decks;

        List<String> seatNumbers = chart.getChartSeats() != null ? chart.getChartSeats().getSeats() : null;
        List<Integer> statuses = chart.getSeatsStatus() != null ? chart.getSeatsStatus().getStatus() : null;
        List<List<Double>> fares = chart.getSeatsStatus() != null ? chart.getSeatsStatus().getFares() : null;

        for (String deckName : List.of("Lower", "Upper")) {
            List<List<Integer>> layout = chart.getChartLayout().getLayout().get(deckName);
            if (layout == null || layout.isEmpty()) continue;

            List<GdsSeatResponse> seats = new ArrayList<>();
            int rows = 0;
            int columns = 0;
            for (List<Integer> cell : layout) {
                if (cell == null || cell.size() < 6) continue;
                int seqNo = cell.get(0);
                if (seatNumbers == null || seqNo < 0 || seqNo >= seatNumbers.size()) continue;

                GdsSeatResponse seat = new GdsSeatResponse();
                seat.setSeatNumber(seatNumbers.get(seqNo));
                seat.setRow(cell.get(1));
                seat.setColumn(cell.get(2));
                seat.setWidth(Math.max(1, cell.get(3)));
                seat.setHeight(Math.max(1, cell.get(4)));
                seat.setSeatTypeId(cell.get(5));
                seat.setSeatType(cell.get(5) == 2 ? "SLEEPER" : cell.get(5) == 4 ? "SEMI_SLEEPER" : "SEATER");

                // 1 = free, 2 = free for male, 3 = free for female, -2 / -3 = booked by male / female, 0 = not available
                int status = statuses != null && seqNo < statuses.size() && statuses.get(seqNo) != null
                        ? statuses.get(seqNo)
                        : 0;
                seat.setStatus(status > 0 ? "AVAILABLE" : "BOOKED");
                if (status == 2) seat.setReservedFor("MALE");
                if (status == 3) seat.setReservedFor("FEMALE");
                if (status == -2) seat.setBookedBy("MALE");
                if (status == -3) seat.setBookedBy("FEMALE");

                // [total_fare, base_fare, ...]
                List<Double> fare = fares != null && seqNo < fares.size() ? fares.get(seqNo) : null;
                if (fare != null && !fare.isEmpty() && fare.get(0) != null) {
                    seat.setFare(BigDecimal.valueOf(fare.get(0)));
                    seat.setBaseFare(fare.size() > 1 && fare.get(1) != null ? BigDecimal.valueOf(fare.get(1)) : null);
                }

                rows = Math.max(rows, seat.getRow() + seat.getHeight());
                columns = Math.max(columns, seat.getColumn() + seat.getWidth());
                seats.add(seat);
            }
            decks.add(new GdsDeckResponse(deckName.toUpperCase(), rows, columns, seats));
        }
        return decks;
    }

    private void fillFromGdsBus(BusSearchResponse response, GdsBus bus, String source, String destination,
                                LocalDate journeyDate) {
        response.setProvider("GDS");
        response.setGdsBusId(bus.getRouteBusId());
        response.setBusName(bus.getCompanyNameWithoutSuffix() != null && !bus.getCompanyNameWithoutSuffix().isBlank()
                ? bus.getCompanyNameWithoutSuffix()
                : bus.getCompanyName());
        response.setBusNumber(bus.getBusTripId() != null ? bus.getBusTripId() : bus.getTripId());
        response.setBusType(toBusType(bus.getBusType()));
        response.setSource(source);
        response.setDestination(destination);
        response.setJourneyDate(journeyDate);
        response.setDepartureTime(toLocalTime(bus.getDeptTime()));
        response.setArrivalTime(toLocalTime(bus.getArrTime()));

        List<BoardingPointResponse> boardingPoints = toBoardingPoints(bus.getPickups(), source);
        response.setBoardingPoints(boardingPoints);
        response.setBoardingPoint(boardingPoints.isEmpty() ? null : boardingPoints.get(0));

        if (bus.getDropoffs() != null && !bus.getDropoffs().isEmpty()) {
            response.setDroppingPoint(bus.getDropoffs().get(0).getDropoffName());
        }

        GdsBusStatus status = bus.getBusStatus();
        if (status != null) {
            response.setAvailableSeats(status.getAvailability());
            response.setFare(lowestFare(status));
        }
    }

    private List<BoardingPointResponse> toBoardingPoints(List<GdsPickup> pickups, String source) {
        List<BoardingPointResponse> boardingPoints = new ArrayList<>();
        if (pickups == null) return boardingPoints;
        for (GdsPickup pickup : pickups) {
            LocalTime pickupTime = toLocalTime(pickup.getPickupTime());
            String area = pickup.getPickupArea() != null && !pickup.getPickupArea().isBlank()
                    ? pickup.getPickupArea()
                    : source;
            String address = pickup.getAddress() != null && !pickup.getAddress().isBlank()
                    ? pickup.getAddress()
                    : pickup.getPickupName() + ", " + source;
            String landmark = pickup.getLandmark() != null && !pickup.getLandmark().isBlank()
                    ? pickup.getLandmark()
                    : null;
            boardingPoints.add(new BoardingPointResponse(
                    pickup.getPickupCode(),
                    pickup.getPickupName(),
                    pickupTime != null ? pickupTime.format(BOARDING_TIME_FORMAT) : null,
                    area,
                    address,
                    landmark,
                    null,
                    null));
        }
        return boardingPoints;
    }

    // BaseFares / DiscFares hold one fare per seat category, 0 when the category is absent.
    private BigDecimal lowestFare(GdsBusStatus status) {
        List<Double> fares = status.getDiscFares() != null && !status.getDiscFares().isEmpty()
                ? status.getDiscFares()
                : status.getBaseFares();
        if (fares == null) return null;
        return fares.stream()
                .filter(fare -> fare != null && fare > 0)
                .min(Double::compare)
                .map(BigDecimal::valueOf)
                .orElse(null);
    }

    private BusType toBusType(GdsBusType gdsBusType) {
        if (gdsBusType == null) return null;
        boolean ac = "AC".equalsIgnoreCase(gdsBusType.getIsAc());
        String seating = gdsBusType.getSeating() != null ? gdsBusType.getSeating().toUpperCase() : "";
        // A semi sleeper is a reclining seat, not a berth.
        String berths = seating.replace("SEMI_SLEEPER", "");
        boolean sleeper = berths.contains("SLEEPER");
        boolean seater = seating.contains("SEATER") || seating.contains("SEMI_SLEEPER");

        if (sleeper && seater && ac) return BusType.AC_SEATER_SLEEPER;
        if (sleeper) return ac ? BusType.AC_SLEEPER : BusType.NON_AC_SLEEPER;
        return ac ? BusType.AC_SEATER : BusType.NON_AC_SEATER;
    }

    // GDS sends "yyyy-MM-dd HH:mm:ss" (older responses: "yyyy-MM-ddTHH:mm:ss.SSSZ").
    private LocalTime toLocalTime(String gdsDateTime) {
        if (gdsDateTime == null || gdsDateTime.length() < 16) return null;
        try {
            return LocalTime.parse(gdsDateTime.substring(11, 16));
        } catch (DateTimeParseException ex) {
            return null;
        }
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
