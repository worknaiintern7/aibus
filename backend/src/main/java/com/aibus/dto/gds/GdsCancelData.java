package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class GdsCancelData {

    @JsonProperty("ChargeAmt")
    private BigDecimal chargeAmt;

    @JsonProperty("RefundAmount")
    private BigDecimal refundAmount;

    public BigDecimal getChargeAmt() {
        return chargeAmt;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }
}
