package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GdsBus {

    @JsonProperty("CompanyName")
    private String companyName;

    @JsonProperty("CompanyNameWithoutSuffix")
    private String companyNameWithoutSuffix;

    @JsonProperty("BusLabel")
    private String busLabel;

    @JsonProperty("DisplayBusType")
    private String displayBusType;

    @JsonProperty("DeptTime")
    private String deptTime;

    @JsonProperty("ArrTime")
    private String arrTime;

    @JsonProperty("Duration")
    private String duration;

    @JsonProperty("TripId")
    private String tripId;

    @JsonProperty("BusTripId")
    private String busTripId;

    @JsonProperty("RouteBusId")
    private int routeBusId;

    @JsonProperty("IsGPS")
    private boolean gps;

    @JsonProperty("IsPremium")
    private boolean premium;

    @JsonProperty("IsFlexi")
    private boolean flexi;

    @JsonProperty("HasDiscount")
    private boolean hasDiscount;

    @JsonProperty("DiscountPct")
    private double discountPct;

    @JsonProperty("BusStatus")
    private GdsBusStatus busStatus;

    public GdsBus() {
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyNameWithoutSuffix() {
        return companyNameWithoutSuffix;
    }

    public void setCompanyNameWithoutSuffix(String companyNameWithoutSuffix) {
        this.companyNameWithoutSuffix = companyNameWithoutSuffix;
    }

    public String getBusLabel() {
        return busLabel;
    }

    public void setBusLabel(String busLabel) {
        this.busLabel = busLabel;
    }

    public String getDisplayBusType() {
        return displayBusType;
    }

    public void setDisplayBusType(String displayBusType) {
        this.displayBusType = displayBusType;
    }

    public String getDeptTime() {
        return deptTime;
    }

    public void setDeptTime(String deptTime) {
        this.deptTime = deptTime;
    }

    public String getArrTime() {
        return arrTime;
    }

    public void setArrTime(String arrTime) {
        this.arrTime = arrTime;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getTripId() {
        return tripId;
    }

    public void setTripId(String tripId) {
        this.tripId = tripId;
    }

    public String getBusTripId() {
        return busTripId;
    }

    public void setBusTripId(String busTripId) {
        this.busTripId = busTripId;
    }

    public int getRouteBusId() {
        return routeBusId;
    }

    public void setRouteBusId(int routeBusId) {
        this.routeBusId = routeBusId;
    }

    public boolean isGps() {
        return gps;
    }

    public void setGps(boolean gps) {
        this.gps = gps;
    }

    public boolean isPremium() {
        return premium;
    }

    public void setPremium(boolean premium) {
        this.premium = premium;
    }

    public boolean isFlexi() {
        return flexi;
    }

    public void setFlexi(boolean flexi) {
        this.flexi = flexi;
    }

    public boolean isHasDiscount() {
        return hasDiscount;
    }

    public void setHasDiscount(boolean hasDiscount) {
        this.hasDiscount = hasDiscount;
    }

    public double getDiscountPct() {
        return discountPct;
    }

    public void setDiscountPct(double discountPct) {
        this.discountPct = discountPct;
    }

    public GdsBusStatus getBusStatus() {
        return busStatus;
    }

    public void setBusStatus(GdsBusStatus busStatus) {
        this.busStatus = busStatus;
    }
}