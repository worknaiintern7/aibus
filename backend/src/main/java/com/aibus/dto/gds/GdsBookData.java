package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class GdsBookData {

    @JsonProperty("TotalFare")
    private BigDecimal totalFare;

    @JsonProperty("TicketNo")
    private String ticketNo;

    @JsonProperty("PNRNo")
    private String pnrNo;

    public BigDecimal getTotalFare() {
        return totalFare;
    }

    public String getTicketNo() {
        return ticketNo;
    }

    public String getPnrNo() {
        return pnrNo;
    }
}
