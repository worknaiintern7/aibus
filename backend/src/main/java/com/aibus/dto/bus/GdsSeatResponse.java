package com.aibus.dto.bus;

import java.math.BigDecimal;

public class GdsSeatResponse {
    private String seatNumber;
    // Position and size inside the deck grid (row runs front to back, column left to right)
    private int row;
    private int column;
    private int width;
    private int height;
    // SEATER, SLEEPER or SEMI_SLEEPER
    private String seatType;
    // Provider seat type code, needed again when the seat is held
    private int seatTypeId;
    // AVAILABLE or BOOKED
    private String status;
    // MALE / FEMALE when an available seat is reserved for that gender, otherwise null
    private String reservedFor;
    // MALE / FEMALE when the provider tells who booked the seat, otherwise null
    private String bookedBy;
    // Total fare of this seat, taxes included
    private BigDecimal fare;
    private BigDecimal baseFare;

    public GdsSeatResponse() {
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }

    public int getColumn() {
        return column;
    }

    public void setColumn(int column) {
        this.column = column;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public String getSeatType() {
        return seatType;
    }

    public void setSeatType(String seatType) {
        this.seatType = seatType;
    }

    public int getSeatTypeId() {
        return seatTypeId;
    }

    public void setSeatTypeId(int seatTypeId) {
        this.seatTypeId = seatTypeId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReservedFor() {
        return reservedFor;
    }

    public void setReservedFor(String reservedFor) {
        this.reservedFor = reservedFor;
    }

    public String getBookedBy() {
        return bookedBy;
    }

    public void setBookedBy(String bookedBy) {
        this.bookedBy = bookedBy;
    }

    public BigDecimal getFare() {
        return fare;
    }

    public void setFare(BigDecimal fare) {
        this.fare = fare;
    }

    public BigDecimal getBaseFare() {
        return baseFare;
    }

    public void setBaseFare(BigDecimal baseFare) {
        this.baseFare = baseFare;
    }
}
