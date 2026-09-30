package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GdsDropoff {

    @JsonProperty("DropoffCode")
    private String dropoffCode;

    @JsonProperty("DropoffName")
    private String dropoffName;

    @JsonProperty("DropoffTime")
    private String dropoffTime;

    public GdsDropoff() {
    }

    public String getDropoffCode() {
        return dropoffCode;
    }

    public void setDropoffCode(String dropoffCode) {
        this.dropoffCode = dropoffCode;
    }

    public String getDropoffName() {
        return dropoffName;
    }

    public void setDropoffName(String dropoffName) {
        this.dropoffName = dropoffName;
    }

    public String getDropoffTime() {
        return dropoffTime;
    }

    public void setDropoffTime(String dropoffTime) {
        this.dropoffTime = dropoffTime;
    }
}
