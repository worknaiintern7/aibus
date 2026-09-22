package com.aibus.dto.booking;

import com.aibus.entity.BookingStatus;

public class CancelBookingResponse {
    private String bookingReference;
    private BookingStatus status;
    private String message;

    public CancelBookingResponse() {
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
