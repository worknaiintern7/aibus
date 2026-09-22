package com.aibus.repository;

import com.aibus.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long>{
    Optional<Otp> findByMobile(String mobile);
    Optional<Otp> findTopByMobileOrderByIdDesc(String mobile);
    void deleteByMobile(String mobile);
}