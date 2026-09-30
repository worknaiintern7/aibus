package com.aibus.dto.booking;

import com.aibus.entity.BookingStatus;

import java.math.BigDecimal;

public class CancelBookingResponse {
    private String bookingReference;
    private BookingStatus status;
    private String message;
    // Only for GDS bookings, where the provider decides the refund
    private BigDecimal refundAmount;
    private BigDecimal cancellationCharge;

    public CancelBookingResponse() {
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public BigDecimal getCancellationCharge() {
        return cancellationCharge;
    }

    public void setCancellationCharge(BigDecimal cancellationCharge) {
        this.cancellationCharge = cancellationCharge;
    }

    public CancelBookingResponse(String bookingReference, BookingStatus status, String message) {
        this.bookingReference = bookingReference;
        this.status = status;
        this.message = message;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
