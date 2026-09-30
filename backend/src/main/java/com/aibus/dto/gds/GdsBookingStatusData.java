package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GdsBookingStatusData {

    public static final int BOOKED = 1;
    public static final int IN_PROGRESS = 0;

    // 1 = booked, 0 = in progress, -1 = failed or cancelled, -2 = hold id not found
    @JsonProperty("Status")
    private int status;

    @JsonProperty("TicketNo")
    private String ticketNo;

    @JsonProperty("PNRNo")
    private String pnrNo;

    @JsonProperty("Message")
    private String message;

    public int getStatus() {
        return status;
    }

    public String getTicketNo() {
        return ticketNo;
    }

    public String getPnrNo() {
        return pnrNo;
    }

    public String getMessage() {
        return message;
    }
}
