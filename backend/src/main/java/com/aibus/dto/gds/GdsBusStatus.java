package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class GdsBusStatus {

    @JsonProperty("Availability")
    private int availability;

    @JsonProperty("BaseFares")
    private List<Double> baseFares;

    @JsonProperty("DiscFares")
    private List<Double> discFares;

    @JsonProperty("TotalTax")
    private double totalTax;

    public GdsBusStatus() {
    }

    public int getAvailability() {
        return availability;
    }

    public void setAvailability(int availability) {
        this.availability = availability;
    }

    public List<Double> getBaseFares() {
        return baseFares;
    }

    public void setBaseFares(List<Double> baseFares) {
        this.baseFares = baseFares;
    }

    public List<Double> getDiscFares() {
        return discFares;
    }

    public void setDiscFares(List<Double> discFares) {
        this.discFares = discFares;
    }

    public double getTotalTax() {
        return totalTax;
    }

    public void setTotalTax(double totalTax) {
        this.totalTax = totalTax;
    }
}