package com.aibus.dto.admin.payment;

import com.aibus.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminPaymentResponse {
    private Long paymentId;
    private String bookingReference;
    private BigDecimal amount;
    private PaymentStatus status;
    private LocalDateTime createdAt;
    private String userMobile;
    private String passengerName;
    private String channel = "ONLINE";
    private String source;
    private String destination;

    public AdminPaymentResponse() {
    }

    public AdminPaymentResponse(Long paymentId, String bookingReference, BigDecimal amount, PaymentStatus status, LocalDateTime createdAt) {
        this.paymentId = paymentId;
        this.bookingReference = bookingReference;
        this.amount = amount;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getUserMobile() {
        return userMobile;
    }

    public void setUserMobile(String userMobile) {
        this.userMobile = userMobile;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
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

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
