package com.aibus.mapper;

import com.aibus.dto.admin.audit.AdminAuditLogResponse;
import com.aibus.dto.admin.auth.AdminProfileResponse;
import com.aibus.dto.admin.booking.AdminBookingResponse;
import com.aibus.dto.admin.bus.AdminBusResponse;
import com.aibus.dto.admin.payment.AdminPaymentResponse;
import com.aibus.dto.admin.route.AdminRouteResponse;
import com.aibus.dto.admin.schedule.AdminScheduleResponse;
import com.aibus.dto.admin.user.AdminUserResponse;
import com.aibus.entity.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class AdminMapper {

    public AdminProfileResponse toAdminProfileResponse(Admin admin) {
        if (admin == null) return null;
        return new AdminProfileResponse(admin.getId(), admin.getName(), admin.getEmail(), admin.getRole(), admin.isActive());
    }

    public AdminUserResponse toAdminUserResponse(User user, long bookingCount, BigDecimal totalBookingAmount, LocalDateTime lastBookingDate) {
        if (user == null) return null;
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setMobile(user.getMobile());
        response.setName(user.getName());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        response.setBookingCount(bookingCount);
        response.setTotalBookingAmount(totalBookingAmount != null ? totalBookingAmount : BigDecimal.ZERO);
        response.setLastBookingDate(lastBookingDate);
        return response;
    }

    public AdminBusResponse toAdminBusResponse(Bus bus) {
        if (bus == null) return null;
        return new AdminBusResponse(bus.getId(), bus.getBusNumber(), bus.getBusName(), bus.getBusType(), bus.getTotalSeats(), bus.isActive());
    }

    public AdminRouteResponse toAdminRouteResponse(Route route) {
        if (route == null) return null;
        return new AdminRouteResponse(route.getId(), route.getSource(), route.getDestination(), route.isActive());
    }

    public AdminScheduleResponse toAdminScheduleResponse(BusSchedule schedule, long availableSeatsCount) {
        if (schedule == null) return null;
        AdminScheduleResponse response = new AdminScheduleResponse();
        response.setId(schedule.getId());
        response.setBusId(schedule.getBus().getId());
        response.setBusNumber(schedule.getBus().getBusNumber());
        response.setBusName(schedule.getBus().getBusName());
        response.setBusType(schedule.getBus().getBusType());
        response.setRouteId(schedule.getRoute().getId());
        response.setSource(schedule.getRoute().getSource());
        response.setDestination(schedule.getRoute().getDestination());
        response.setJourneyDate(schedule.getJourneyDate());
        response.setDepartureTime(schedule.getDepartureTime());
        response.setArrivalTime(schedule.getArrivalTime());
        response.setBoardingPoint(schedule.getBoardingPoint());
        response.setDroppingPoint(schedule.getDroppingPoint());
        response.setBaseFare(schedule.getBaseFare());
        response.setStatus(schedule.getStatus());
        response.setTotalSeats(schedule.getBus().getTotalSeats());
        response.setAvailableSeatsCount(availableSeatsCount);
        return response;
    }

    public AdminBookingResponse toAdminBookingResponse(Booking booking) {
        if (booking == null) return null;
        AdminBookingResponse response = new AdminBookingResponse();
        response.setId(booking.getId());
        response.setBookingReference(booking.getBookingReference());
        response.setUserId(booking.getUser().getId());
        response.setUserName(booking.getUser().getName());
        response.setUserMobile(booking.getUser().getMobile());
        response.setBusName(booking.getBusSchedule().getBus().getBusName());
        response.setBusNumber(booking.getBusSchedule().getBus().getBusNumber());
        response.setSource(booking.getBusSchedule().getRoute().getSource());
        response.setDestination(booking.getBusSchedule().getRoute().getDestination());
        response.setJourneyDate(booking.getBusSchedule().getJourneyDate());
        response.setTotalAmount(booking.getTotalAmount());
        response.setStatus(booking.getStatus());
        response.setCreatedAt(booking.getCreatedAt());
        return response;
    }

    public AdminPaymentResponse toAdminPaymentResponse(Payment payment) {
        if (payment == null) return null;
        return new AdminPaymentResponse(
                payment.getId(),
                payment.getBooking().getBookingReference(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getCreatedAt()
        );
    }

    public AdminAuditLogResponse toAdminAuditLogResponse(AdminAuditLog log) {
        if (log == null) return null;
        return new AdminAuditLogResponse(
                log.getId(),
                log.getAdminId(),
                log.getAdminEmail(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDescription(),
                log.getCreatedAt()
        );
    }
}
