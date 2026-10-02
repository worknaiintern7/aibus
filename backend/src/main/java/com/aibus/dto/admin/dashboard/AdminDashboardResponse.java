package com.aibus.dto.admin.dashboard;

import java.math.BigDecimal;

public class AdminDashboardResponse {
    private long totalUsers;
    private long activeUsers;
    private long totalBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long totalBuses;
    private long activeBuses;
    private long totalRoutes;
    private long upcomingSchedules;
    private BigDecimal totalRevenue;
    private BigDecimal gdsBalance;
    private boolean apiConnected;
    private long gdsBookingsCount;
    private long localBookingsCount;

    public AdminDashboardResponse() {
    }

    public BigDecimal getGdsBalance() {
        return gdsBalance;
    }

    public void setGdsBalance(BigDecimal gdsBalance) {
        this.gdsBalance = gdsBalance;
    }

    public boolean isApiConnected() {
        return apiConnected;
    }

    public void setApiConnected(boolean apiConnected) {
        this.apiConnected = apiConnected;
    }

    public long getGdsBookingsCount() {
        return gdsBookingsCount;
    }

    public void setGdsBookingsCount(long gdsBookingsCount) {
        this.gdsBookingsCount = gdsBookingsCount;
    }

    public long getLocalBookingsCount() {
        return localBookingsCount;
    }

    public void setLocalBookingsCount(long localBookingsCount) {
        this.localBookingsCount = localBookingsCount;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getConfirmedBookings() {
        return confirmedBookings;
    }

    public void setConfirmedBookings(long confirmedBookings) {
        this.confirmedBookings = confirmedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public long getTotalBuses() {
        return totalBuses;
    }

    public void setTotalBuses(long totalBuses) {
        this.totalBuses = totalBuses;
    }

    public long getActiveBuses() {
        return activeBuses;
    }

    public void setActiveBuses(long activeBuses) {
        this.activeBuses = activeBuses;
    }

    public long getTotalRoutes() {
        return totalRoutes;
    }

    public void setTotalRoutes(long totalRoutes) {
        this.totalRoutes = totalRoutes;
    }

    public long getUpcomingSchedules() {
        return upcomingSchedules;
    }

    public void setUpcomingSchedules(long upcomingSchedules) {
        this.upcomingSchedules = upcomingSchedules;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}
