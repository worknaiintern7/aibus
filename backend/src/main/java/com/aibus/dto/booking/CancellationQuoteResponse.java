package com.aibus.dto.booking;

import java.math.BigDecimal;

/**
 * What the customer gets back if the booking is cancelled right now.
 */
public class CancellationQuoteResponse {
    private String bookingReference;
    private boolean cancellable;
    private BigDecimal totalFare;
    private BigDecimal chargePercent;
    private BigDecimal refundAmount;

    public CancellationQuoteResponse() {
    }

    public CancellationQuoteResponse(String bookingReference, boolean cancellable, BigDecimal totalFare,
                                     BigDecimal chargePercent, BigDecimal refundAmount) {
        this.bookingReference = bookingReference;
        this.cancellable = cancellable;
        this.totalFare = totalFare;
        this.chargePercent = chargePercent;
        this.refundAmount = refundAmount;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public boolean isCancellable() {
        return cancellable;
    }

    public void setCancellable(boolean cancellable) {
        this.cancellable = cancellable;
    }

    public BigDecimal getTotalFare() {
        return totalFare;
    }

    public void setTotalFare(BigDecimal totalFare) {
        this.totalFare = totalFare;
    }

    public BigDecimal getChargePercent() {
        return chargePercent;
    }

    public void setChargePercent(BigDecimal chargePercent) {
        this.chargePercent = chargePercent;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }
}
