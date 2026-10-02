package com.aibus.dto.admin.booking;

import com.aibus.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AdminBookingResponse {
    private Long id;
    private String bookingReference;
    private Long userId;
    private String userName;
    private String userMobile;
    private String busName;
    private String busNumber;
    private String source;
    private String destination;
    private LocalDate journeyDate;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private String provider = "LOCAL";
    private String pnrNo;
    private String ticketNo;
    private java.time.LocalTime departureTime;
    private java.time.LocalTime arrivalTime;
    private String boardingPoint;
    private String droppingPoint;
    private String selectedSeats;

    public AdminBookingResponse() {
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getPnrNo() {
        return pnrNo;
    }

    public void setPnrNo(String pnrNo) {
        this.pnrNo = pnrNo;
    }

    public String getTicketNo() {
        return ticketNo;
    }

    public void setTicketNo(String ticketNo) {
        this.ticketNo = ticketNo;
    }

    public java.time.LocalTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(java.time.LocalTime departureTime) {
        this.departureTime = departureTime;
    }

    public java.time.LocalTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(java.time.LocalTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getBoardingPoint() {
        return boardingPoint;
    }

    public void setBoardingPoint(String boardingPoint) {
        this.boardingPoint = boardingPoint;
    }

    public String getDroppingPoint() {
        return droppingPoint;
    }

    public void setDroppingPoint(String droppingPoint) {
        this.droppingPoint = droppingPoint;
    }

    public String getSelectedSeats() {
        return selectedSeats;
    }

    public void setSelectedSeats(String selectedSeats) {
        this.selectedSeats = selectedSeats;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserMobile() {
        return userMobile;
    }

    public void setUserMobile(String userMobile) {
        this.userMobile = userMobile;
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

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
