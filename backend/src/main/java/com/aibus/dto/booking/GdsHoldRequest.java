package com.aibus.dto.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.util.List;

public class GdsHoldRequest {

    // Null for guest bookings
    private Long userId;

    @NotBlank(message = "Source city is required")
    private String source;

    @NotBlank(message = "Destination city is required")
    private String destination;

    @NotNull(message = "Journey date is required")
    private LocalDate journeyDate;

    @NotNull(message = "Bus is required")
    private Integer busId;

    @NotBlank(message = "Please select a boarding point")
    private String pickupId;

    @NotBlank(message = "Please select a dropping point")
    private String dropoffId;

    @NotBlank(message = "Contact mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Contact mobile must be a valid 10-digit Indian number")
    private String contactMobile;

    @Email(message = "Please enter a valid email address")
    private String contactEmail;

    @Valid
    @NotEmpty(message = "Passenger details are required")
    private List<PassengerRequest> passengers;

    public GdsHoldRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public Integer getBusId() {
        return busId;
    }

    public void setBusId(Integer busId) {
        this.busId = busId;
    }

    public String getPickupId() {
        return pickupId;
    }

    public void setPickupId(String pickupId) {
        this.pickupId = pickupId;
    }

    public String getDropoffId() {
        return dropoffId;
    }

    public void setDropoffId(String dropoffId) {
        this.dropoffId = dropoffId;
    }

    public String getContactMobile() {
        return contactMobile;
    }

    public void setContactMobile(String contactMobile) {
        this.contactMobile = contactMobile;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public List<PassengerRequest> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<PassengerRequest> passengers) {
        this.passengers = passengers;
    }
}
