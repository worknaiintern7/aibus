package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class GdsChartData {

    @JsonProperty("ChartLayout")
    private ChartLayout chartLayout;

    @JsonProperty("ChartSeats")
    private ChartSeats chartSeats;

    @JsonProperty("SeatsStatus")
    private SeatsStatus seatsStatus;

    @JsonProperty("Pickups")
    private List<GdsPickup> pickups;

    @JsonProperty("Dropoffs")
    private List<GdsDropoff> dropoffs;

    @JsonProperty("Canc")
    private List<CancellationSlab> cancellation;

    @JsonProperty("MaxAllowedSeats")
    private Integer maxAllowedSeats;

    public ChartLayout getChartLayout() {
        return chartLayout;
    }

    public ChartSeats getChartSeats() {
        return chartSeats;
    }

    public SeatsStatus getSeatsStatus() {
        return seatsStatus;
    }

    public List<GdsPickup> getPickups() {
        return pickups;
    }

    public List<GdsDropoff> getDropoffs() {
        return dropoffs;
    }

    public List<CancellationSlab> getCancellation() {
        return cancellation;
    }

    public Integer getMaxAllowedSeats() {
        return maxAllowedSeats;
    }

    public static class ChartLayout {

        /*
         * Deck name ("Lower" / "Upper") -> seats.
         * Each seat is [seq_no, row, col, width, height, seat_type].
         */
        @JsonProperty("Layout")
        private Map<String, List<List<Integer>>> layout;

        public Map<String, List<List<Integer>>> getLayout() {
            return layout;
        }
    }

    public static class ChartSeats {

        // seat_no = Seats[seq_no]
        @JsonProperty("Seats")
        private List<String> seats;

        public List<String> getSeats() {
            return seats;
        }
    }

    public static class SeatsStatus {

        // status = Status[seq_no]
        @JsonProperty("Status")
        private List<Integer> status;

        // fare = Fares[seq_no] = [total_fare, base_fare, ...]
        @JsonProperty("Fares")
        private List<List<Double>> fares;

        public List<Integer> getStatus() {
            return status;
        }

        public List<List<Double>> getFares() {
            return fares;
        }
    }

    public static class CancellationSlab {

        @JsonProperty("Mins")
        private int mins;

        @JsonProperty("Pct")
        private double pct;

        public int getMins() {
            return mins;
        }

        public double getPct() {
            return pct;
        }
    }
}
