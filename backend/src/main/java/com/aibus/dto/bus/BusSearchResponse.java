package com.aibus.dto.bus;

import com.aibus.entity.BusType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class BusSearchResponse {
    private Long scheduleId;
    private Long busId;
    private String busName;
    private String busNumber;
    private BusType busType;
    private String source;
    private String destination;
    private LocalDate journeyDate;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private BoardingPointResponse boardingPoint;
    private List<BoardingPointResponse> boardingPoints;
    private String droppingPoint;
    private BigDecimal fare;
    private long availableSeats;
    // "LOCAL" = schedule from our database, "GDS" = live bus from the GDS provider
    private String provider = "LOCAL";
    private Integer gdsBusId;

    public BusSearchResponse() {
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public Integer getGdsBusId() {
        return gdsBusId;
    }

    public void setGdsBusId(Integer gdsBusId) {
        this.gdsBusId = gdsBusId;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Long getBusId() {
        return busId;
    }

    public void setBusId(Long busId) {
        this.busId = busId;
    }

    public String getBusName() {
        return busName;
    }

    public void setBusName(String busName) {
        this.busName = busName;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public void setBusNumber(String busNumber) {
        this.busNumber = busNumber;
    }

    public BusType getBusType() {
        return busType;
    }

    public void setBusType(BusType busType) {
        this.busType = busType;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDate getJourneyDate() {
        return journeyDate;
    }

    public void setJourneyDate(LocalDate journeyDate) {
        this.journeyDate = journeyDate;
    }

    public LocalTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public BoardingPointResponse getBoardingPoint() {
        return boardingPoint;
    }

    public void setBoardingPoint(BoardingPointResponse boardingPoint) {
        this.boardingPoint = boardingPoint;
    }

    public String getBoardingPointName() {
        return boardingPoint != null ? boardingPoint.getName() : null;
    }

    public List<BoardingPointResponse> getBoardingPoints() {
        return boardingPoints;
    }

    public void setBoardingPoints(List<BoardingPointResponse> boardingPoints) {
        this.boardingPoints = boardingPoints;
    }

    public String getDroppingPoint() {
        return droppingPoint;
    }

    public void setDroppingPoint(String droppingPoint) {
        this.droppingPoint = droppingPoint;
    }

    public BigDecimal getFare() {
        return fare;
    }

    public void setFare(BigDecimal fare) {
        this.fare = fare;
    }

    public long getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(long availableSeats) {
        this.availableSeats = availableSeats;
    }
}
