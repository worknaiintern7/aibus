package com.aibus.dto.bus;

import java.util.List;

/**
 * A live GDS bus with its real seat chart, pickup / dropoff points and cancellation policy.
 */
public class GdsBusDetailsResponse extends BusSearchResponse {
    private String busLabel;
    private List<BoardingPointResponse> droppingPoints;
    private List<GdsDeckResponse> decks;
    private int maxSeatsPerBooking;
    private List<CancellationSlab> cancellationPolicy;

    public GdsBusDetailsResponse() {
    }

    public String getBusLabel() {
        return busLabel;
    }

    public void setBusLabel(String busLabel) {
        this.busLabel = busLabel;
    }

    public List<BoardingPointResponse> getDroppingPoints() {
        return droppingPoints;
    }

    public void setDroppingPoints(List<BoardingPointResponse> droppingPoints) {
        this.droppingPoints = droppingPoints;
    }

    public List<GdsDeckResponse> getDecks() {
        return decks;
    }

    public void setDecks(List<GdsDeckResponse> decks) {
        this.decks = decks;
    }

    public int getMaxSeatsPerBooking() {
        return maxSeatsPerBooking;
    }

    public void setMaxSeatsPerBooking(int maxSeatsPerBooking) {
        this.maxSeatsPerBooking = maxSeatsPerBooking;
    }

    public List<CancellationSlab> getCancellationPolicy() {
        return cancellationPolicy;
    }

    public void setCancellationPolicy(List<CancellationSlab> cancellationPolicy) {
        this.cancellationPolicy = cancellationPolicy;
    }

    /**
     * Cancelling at least minutesBeforeDeparture before departure costs chargePercent of the fare.
     */
    public static class CancellationSlab {
        private int minutesBeforeDeparture;
        private double chargePercent;

        public CancellationSlab() {
        }

        public CancellationSlab(int minutesBeforeDeparture, double chargePercent) {
            this.minutesBeforeDeparture = minutesBeforeDeparture;
            this.chargePercent = chargePercent;
        }

        public int getMinutesBeforeDeparture() {
            return minutesBeforeDeparture;
        }

        public void setMinutesBeforeDeparture(int minutesBeforeDeparture) {
            this.minutesBeforeDeparture = minutesBeforeDeparture;
        }

        public double getChargePercent() {
            return chargePercent;
        }

        public void setChargePercent(double chargePercent) {
            this.chargePercent = chargePercent;
        }
    }
}
