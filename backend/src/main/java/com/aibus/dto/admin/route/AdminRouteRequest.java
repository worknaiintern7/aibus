package com.aibus.dto.admin.route;

import jakarta.validation.constraints.NotBlank;

public class AdminRouteRequest {

    @NotBlank(message = "Source city is required")
    private String source;

    @NotBlank(message = "Destination city is required")
    private String destination;

    private boolean active = true;

    public AdminRouteRequest() {
    }

    public AdminRouteRequest(String source, String destination, boolean active) {
        this.source = source;
        this.destination = destination;
        this.active = active;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
