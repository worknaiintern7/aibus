package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class GdsCancellableData {

    @JsonProperty("IsCancellable")
    private boolean cancellable;

    @JsonProperty("ChargePct")
    private BigDecimal chargePct;

    @JsonProperty("TotalFare")
    private BigDecimal totalFare;

    @JsonProperty("RefundAmount")
    private BigDecimal refundAmount;

    public boolean isCancellable() {
        return cancellable;
    }

    public BigDecimal getChargePct() {
        return chargePct;
    }

    public BigDecimal getTotalFare() {
        return totalFare;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }
}
