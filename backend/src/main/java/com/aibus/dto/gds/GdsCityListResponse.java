package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class GdsCityListResponse {

    private boolean success;
    private List<GdsCity> data;

    public GdsCityListResponse() {
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<GdsCity> getData() {
        return data;
    }

    public void setData(List<GdsCity> data) {
        this.data = data;
    }

    public static class GdsCity {

        @JsonProperty("CityId")
        private int cityId;

        @JsonProperty("City")
        private String city;

        @JsonProperty("State")
        private String state;

        public GdsCity() {
        }

        public int getCityId() {
            return cityId;
        }

        public void setCityId(int cityId) {
            this.cityId = cityId;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }
    }
}
