package com.aibus.service;

import com.aibus.dto.admin.user.AdminUserResponse;
import com.aibus.dto.admin.user.UpdateUserStatusRequest;
import com.aibus.dto.common.PageResponse;
import com.aibus.entity.Admin;
import com.aibus.entity.Booking;
import com.aibus.entity.User;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.mapper.AdminMapper;
import com.aibus.repository.BookingRepository;
import com.aibus.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

    public AdminUserService(UserRepository userRepository,
                            BookingRepository bookingRepository,
                            AdminMapper adminMapper,
                            AdminAuditService adminAuditService) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.adminMapper = adminMapper;
        this.adminAuditService = adminAuditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getUsers(String search, Pageable pageable) {
        Page<User> page;
        if (search != null && !search.isBlank()) {
            page = userRepository.findByMobileContainingOrNameContainingIgnoreCase(search.trim(), search.trim(), pageable);
        } else {
            page = userRepository.findAll(pageable);
        }

        List<AdminUserResponse> content = page.getContent().stream().map(this::mapToAdminUserResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToAdminUserResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUserStatus(Long id, UpdateUserStatusRequest request, Admin currentAdmin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(request.getActive());
        User updated = userRepository.save(user);

        String action = request.getActive() ? "USER_UNBLOCKED" : "USER_BLOCKED";
        adminAuditService.log(currentAdmin, action, "User", String.valueOf(id), "Updated user active status to " + request.getActive());

        return mapToAdminUserResponse(updated);
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        List<Booking> userBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        long count = userBookings.size();
        BigDecimal totalAmount = userBookings.stream()
                .filter(b -> b.getStatus().name().equals("CONFIRMED") || b.getStatus().name().equals("COMPLETED"))
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        LocalDateTime lastBooking = userBookings.isEmpty() ? null : userBookings.get(0).getCreatedAt();

        return adminMapper.toAdminUserResponse(user, count, totalAmount, lastBooking);
    }
}
