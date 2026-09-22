package com.aibus.dto.admin.route;

public class AdminRouteResponse {
    private Long id;
    private String source;
    private String destination;
    private boolean active;

    public AdminRouteResponse() {
    }

    public AdminRouteResponse(Long id, String source, String destination, boolean active) {
        this.id = id;
        this.source = source;
        this.destination = destination;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
