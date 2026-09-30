package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GdsBusType {

    @JsonProperty("IsAC")
    private String isAc;

    @JsonProperty("Seating")
    private String seating;

    @JsonProperty("Make")
    private String make;

    public GdsBusType() {
    }

    public String getIsAc() {
        return isAc;
    }

    public void setIsAc(String isAc) {
        this.isAc = isAc;
    }

    public String getSeating() {
        return seating;
    }

    public void setSeating(String seating) {
        this.seating = seating;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }
}
