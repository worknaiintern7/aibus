package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class GdsSearchResponse {

    private boolean success;
    private GdsData data;

    public GdsSearchResponse() {
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public GdsData getData() {
        return data;
    }

    public void setData(GdsData data) {
        this.data = data;
    }

    public static class GdsData {

        @JsonProperty("ToCityId")
        private int toCityId;

        @JsonProperty("FromCityId")
        private int fromCityId;

        @JsonProperty("Buses")
        private List<GdsBus> buses;

        @JsonProperty("JourneyDate")
        private String journeyDate;

        @JsonProperty("ToCityName")
        private String toCityName;

        @JsonProperty("FromCityName")
        private String fromCityName;

        @JsonProperty("TotalAvailSeats")
        private int totalAvailSeats;

        public GdsData() {
        }

        public int getToCityId() {
            return toCityId;
        }

        public void setToCityId(int toCityId) {
            this.toCityId = toCityId;
        }

        public int getFromCityId() {
            return fromCityId;
        }

        public void setFromCityId(int fromCityId) {
            this.fromCityId = fromCityId;
        }

        public List<GdsBus> getBuses() {
            return buses;
        }

        public void setBuses(List<GdsBus> buses) {
            this.buses = buses;
        }

        public String getJourneyDate() {
            return journeyDate;
        }

        public void setJourneyDate(String journeyDate) {
            this.journeyDate = journeyDate;
        }

        public String getToCityName() {
            return toCityName;
        }

        public void setToCityName(String toCityName) {
            this.toCityName = toCityName;
        }

        public String getFromCityName() {
            return fromCityName;
        }

        public void setFromCityName(String fromCityName) {
            this.fromCityName = fromCityName;
        }

        public int getTotalAvailSeats() {
            return totalAvailSeats;
        }

        public void setTotalAvailSeats(int totalAvailSeats) {
            this.totalAvailSeats = totalAvailSeats;
        }
    }
}