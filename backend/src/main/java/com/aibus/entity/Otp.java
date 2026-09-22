package com.aibus.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otps")
public class Otp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String mobile;

    @Column(nullable=false)
    private String otp;

    @Column(nullable=false)
    private LocalDateTime expiresAt;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean used = false;

    public Otp(){

    }

    public Long getId(){
        return id;
    }

    public String getMobile(){
        return mobile;
    }

    public void setMobile(String mobile){
        this.mobile= mobile;
    }

    public String getOtp(){
        return otp;
    }

    public void setOtp(String otp){
        this.otp = otp;
    }

    public LocalDateTime getExpiresAt(){
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt){
        this.expiresAt = expiresAt;
    }

    public boolean isUsed(){
        return used;
    }

    public void setUsed(boolean used){
        this.used = used;
    }

}