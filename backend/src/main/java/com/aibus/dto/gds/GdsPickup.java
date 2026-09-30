package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GdsPickup {

    @JsonProperty("PickupCode")
    private String pickupCode;

    @JsonProperty("PickupName")
    private String pickupName;

    @JsonProperty("PickupArea")
    private String pickupArea;

    @JsonProperty("PickupTime")
    private String pickupTime;

    // Address, Landmark and Contact are only sent by the Chart API
    @JsonProperty("Address")
    private String address;

    @JsonProperty("Landmark")
    private String landmark;

    @JsonProperty("Contact")
    private String contact;

    public GdsPickup() {
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getPickupCode() {
        return pickupCode;
    }

    public void setPickupCode(String pickupCode) {
        this.pickupCode = pickupCode;
    }

    public String getPickupName() {
        return pickupName;
    }

    public void setPickupName(String pickupName) {
        this.pickupName = pickupName;
    }

    public String getPickupArea() {
        return pickupArea;
    }

    public void setPickupArea(String pickupArea) {
        this.pickupArea = pickupArea;
    }

    public String getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(String pickupTime) {
        this.pickupTime = pickupTime;
    }
}
