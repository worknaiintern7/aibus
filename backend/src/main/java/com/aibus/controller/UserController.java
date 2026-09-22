package com.aibus.controller;

import com.aibus.dto.booking.BookingDetailsResponse;
import com.aibus.dto.common.ApiResponse;
import com.aibus.dto.user.UpdateUserRequest;
import com.aibus.dto.user.UserResponse;
import com.aibus.service.BookingService;
import com.aibus.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final BookingService bookingService;

    public UserController(UserService userService, BookingService bookingService) {
        this.userService = userService;
        this.bookingService = bookingService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id,
                                                                 @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User profile updated successfully", response));
    }

    @GetMapping("/{id}/bookings")
    public ResponseEntity<ApiResponse<List<BookingDetailsResponse>>> getUserBookings(@PathVariable Long id) {
        List<BookingDetailsResponse> response = bookingService.getUserBookings(id);
        return ResponseEntity.ok(ApiResponse.success("User bookings fetched successfully", response));
    }
}
