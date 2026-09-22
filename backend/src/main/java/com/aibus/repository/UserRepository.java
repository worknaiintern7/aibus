package com.aibus.repository;

import com.aibus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobile(String mobile);
    boolean existsByMobile(String mobile);
    long countByActiveTrue();
    Page<User> findByMobileContainingOrNameContainingIgnoreCase(String mobile, String name, Pageable pageable);
}