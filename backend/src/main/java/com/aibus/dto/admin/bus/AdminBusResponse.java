package com.aibus.dto.admin.bus;

import com.aibus.entity.BusType;

public class AdminBusResponse {
    private Long id;
    private String busNumber;
    private String busName;
    private BusType busType;
    private int totalSeats;
    private boolean active;

    public AdminBusResponse() {
    }

    public AdminBusResponse(Long id, String busNumber, String busName, BusType busType, int totalSeats, boolean active) {
        this.id = id;
        this.busNumber = busNumber;
        this.busName = busName;
        this.busType = busType;
        this.totalSeats = totalSeats;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public void setBusNumber(String busNumber) {
        this.busNumber = busNumber;
    }

    public String getBusName() {
        return busName;
    }

    public void setBusName(String busName) {
        this.busName = busName;
    }

    public BusType getBusType() {
        return busType;
    }

    public void setBusType(BusType busType) {
        this.busType = busType;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
