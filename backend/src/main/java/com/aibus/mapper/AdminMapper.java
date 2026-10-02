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
        response.setUserId(booking.getUser() != null ? booking.getUser().getId() : null);
        response.setUserName(booking.getUser() != null ? booking.getUser().getName() : "Customer");
        response.setUserMobile(booking.getUser() != null ? booking.getUser().getMobile() : "");
        response.setBusName(booking.getBusSchedule().getBus().getBusName());
        response.setBusNumber(booking.getBusSchedule().getBus().getBusNumber());
        response.setSource(booking.getBusSchedule().getRoute().getSource());
        response.setDestination(booking.getBusSchedule().getRoute().getDestination());
        response.setJourneyDate(booking.getBusSchedule().getJourneyDate());
        response.setDepartureTime(booking.getBusSchedule().getDepartureTime());
        response.setArrivalTime(booking.getBusSchedule().getArrivalTime());
        response.setBoardingPoint(booking.getBusSchedule().getBoardingPoint());
        response.setDroppingPoint(booking.getBusSchedule().getDroppingPoint());
        response.setTotalAmount(booking.getTotalAmount());
        response.setStatus(booking.getStatus());
        response.setCreatedAt(booking.getCreatedAt());
        response.setProvider("LOCAL");
        return response;
    }

    public AdminBookingResponse toAdminBookingResponse(GdsBooking gdsBooking) {
        if (gdsBooking == null) return null;
        AdminBookingResponse response = new AdminBookingResponse();
        response.setId(gdsBooking.getId());
        response.setBookingReference(gdsBooking.getBookingReference());
        response.setUserId(gdsBooking.getUser() != null ? gdsBooking.getUser().getId() : null);
        String name = "Guest Customer";
        if (gdsBooking.getUser() != null && gdsBooking.getUser().getName() != null) {
            name = gdsBooking.getUser().getName();
        } else if (gdsBooking.getPassengers() != null && !gdsBooking.getPassengers().isEmpty()) {
            name = gdsBooking.getPassengers().get(0).getName();
        }
        response.setUserName(name);
        response.setUserMobile(gdsBooking.getContactMobile());
        response.setBusName(gdsBooking.getBusName() != null ? gdsBooking.getBusName() : "Live GDS Operator");
        response.setBusNumber(gdsBooking.getBusNumber() != null ? gdsBooking.getBusNumber() : "GDS-" + gdsBooking.getGdsBusId());
        response.setSource(gdsBooking.getSource());
        response.setDestination(gdsBooking.getDestination());
        response.setJourneyDate(gdsBooking.getJourneyDate());
        response.setDepartureTime(gdsBooking.getDepartureTime());
        response.setArrivalTime(gdsBooking.getArrivalTime());
        response.setBoardingPoint(gdsBooking.getPickupName());
        response.setDroppingPoint(gdsBooking.getDropoffName());
        response.setPnrNo(gdsBooking.getPnrNo());
        response.setTicketNo(gdsBooking.getTicketNo());
        response.setTotalAmount(gdsBooking.getTotalAmount());
        response.setStatus(gdsBooking.getStatus());
        response.setCreatedAt(gdsBooking.getCreatedAt());
        response.setProvider("GDS");

        if (gdsBooking.getPassengers() != null && !gdsBooking.getPassengers().isEmpty()) {
            String seatList = gdsBooking.getPassengers().stream()
                    .map(GdsBookingPassenger::getSeatNumber)
                    .collect(java.util.stream.Collectors.joining(", "));
            response.setSelectedSeats(seatList);
        }
        return response;
    }

    public AdminPaymentResponse toAdminPaymentResponse(Payment payment) {
        if (payment == null) return null;
        AdminPaymentResponse res = new AdminPaymentResponse(
                payment.getId(),
                payment.getBooking().getBookingReference(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getCreatedAt()
        );
        if (payment.getBooking() != null && payment.getBooking().getUser() != null) {
            res.setUserMobile(payment.getBooking().getUser().getMobile());
            res.setPassengerName(payment.getBooking().getUser().getName());
        }
        if (payment.getBooking() != null && payment.getBooking().getBusSchedule() != null && payment.getBooking().getBusSchedule().getRoute() != null) {
            res.setSource(payment.getBooking().getBusSchedule().getRoute().getSource());
            res.setDestination(payment.getBooking().getBusSchedule().getRoute().getDestination());
        }
        res.setChannel("IN-HOUSE");
        return res;
    }

    public AdminPaymentResponse toAdminPaymentResponse(GdsBooking gdsBooking) {
        if (gdsBooking == null) return null;
        PaymentStatus status = PaymentStatus.SUCCESS;
        if (gdsBooking.getStatus() == BookingStatus.CANCELLED) {
            status = PaymentStatus.REFUNDED;
        } else if (gdsBooking.getStatus() == BookingStatus.FAILED) {
            status = PaymentStatus.FAILED;
        } else if (gdsBooking.getStatus() == BookingStatus.PENDING) {
            status = PaymentStatus.INITIATED;
        }

        AdminPaymentResponse res = new AdminPaymentResponse(
                gdsBooking.getId(),
                gdsBooking.getBookingReference(),
                gdsBooking.getTotalAmount(),
                status,
                gdsBooking.getCreatedAt()
        );
        res.setUserMobile(gdsBooking.getContactMobile());
        String passenger = "Customer";
        if (gdsBooking.getUser() != null && gdsBooking.getUser().getName() != null) {
            passenger = gdsBooking.getUser().getName();
        } else if (gdsBooking.getPassengers() != null && !gdsBooking.getPassengers().isEmpty()) {
            passenger = gdsBooking.getPassengers().get(0).getName();
        }
        res.setPassengerName(passenger);
        res.setSource(gdsBooking.getSource());
        res.setDestination(gdsBooking.getDestination());
        res.setChannel("RAZORPAY / GDS");
        return res;
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
