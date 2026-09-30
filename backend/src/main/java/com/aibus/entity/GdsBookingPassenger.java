package com.aibus.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "gds_booking_passengers")
public class GdsBookingPassenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "gds_booking_id", nullable = false)
    private GdsBooking booking;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int age;

    @Column(nullable = false)
    private String gender;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;

    @Column(nullable = false)
    private BigDecimal fare;

    public GdsBookingPassenger() {
    }

    public GdsBookingPassenger(GdsBooking booking, String name, int age, String gender, String seatNumber, BigDecimal fare) {
        this.booking = booking;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.seatNumber = seatNumber;
        this.fare = fare;
    }

    public Long getId() {
        return id;
    }

    public GdsBooking getBooking() {
        return booking;
    }

    public void setBooking(GdsBooking booking) {
        this.booking = booking;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public BigDecimal getFare() {
        return fare;
    }

    public void setFare(BigDecimal fare) {
        this.fare = fare;
    }
}
