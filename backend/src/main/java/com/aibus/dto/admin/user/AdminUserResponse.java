package com.aibus.dto.admin.user;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminUserResponse {
    private Long id;
    private String mobile;
    private String name;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long bookingCount;
    private BigDecimal totalBookingAmount;
    private LocalDateTime lastBookingDate;

    public AdminUserResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public BigDecimal getTotalBookingAmount() {
        return totalBookingAmount;
    }

    public void setTotalBookingAmount(BigDecimal totalBookingAmount) {
        this.totalBookingAmount = totalBookingAmount;
    }

    public LocalDateTime getLastBookingDate() {
        return lastBookingDate;
    }

    public void setLastBookingDate(LocalDateTime lastBookingDate) {
        this.lastBookingDate = lastBookingDate;
    }
}
