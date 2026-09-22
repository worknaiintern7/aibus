package com.aibus.dto.bus;

import com.aibus.entity.SeatStatus;
import com.aibus.entity.SeatType;

public class SeatResponse {
    private String seatNumber;
    private SeatType seatType;
    private SeatStatus status;
    private int rowNumber;
    private int columnNumber;

    public SeatResponse() {
    }

    public SeatResponse(String seatNumber, SeatType seatType, SeatStatus status, int rowNumber, int columnNumber) {
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.status = status;
        this.rowNumber = rowNumber;
        this.columnNumber = columnNumber;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public SeatType getSeatType() {
        return seatType;
    }

    public void setSeatType(SeatType seatType) {
        this.seatType = seatType;
    }

    public SeatStatus getStatus() {
        return status;
    }

    public void setStatus(SeatStatus status) {
        this.status = status;
    }

    public int getRowNumber() {
        return rowNumber;
    }

    public void setRowNumber(int rowNumber) {
        this.rowNumber = rowNumber;
    }

    public int getColumnNumber() {
        return columnNumber;
    }

    public void setColumnNumber(int columnNumber) {
        this.columnNumber = columnNumber;
    }
}
