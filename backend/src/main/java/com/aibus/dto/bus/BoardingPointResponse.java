package com.aibus.dto.bus;

public class BoardingPointResponse {
    private String id;
    private String name;
    private String time;
    private String area;
    private String address;
    private String landmark;
    private Double latitude;
    private Double longitude;

    public BoardingPointResponse() {
    }

    public BoardingPointResponse(String name, String address, String landmark, Double latitude, Double longitude) {
        this.name = name;
        this.address = address;
        this.landmark = landmark;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public BoardingPointResponse(String id, String name, String time, String area, String address, String landmark, Double latitude, Double longitude) {
        this.id = id;
        this.name = name;
        this.time = time;
        this.area = area;
        this.address = address;
        this.landmark = landmark;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
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

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
