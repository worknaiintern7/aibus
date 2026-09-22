# AIBus Backend - Part A (Customer-Side Booking System)

Spring Boot REST API backend for AIBus application built with Java 17+, Spring Boot 4.x, Spring Data JPA, Hibernate, and PostgreSQL (`aibus_db`).

---

## 🏗️ Architecture & Package Structure

```text
src/main/java/com/aibus/
├── AibusBackendApplication.java    # Spring Boot Main Entrypoint
│
├── controller/
│   ├── AuthController.java         # Authentication APIs (/api/auth/*)
│   ├── UserController.java         # Customer Profile APIs (/api/users/*)
│   ├── BusController.java          # Bus Search, Schedule & Seat Availability (/api/buses/*)
│   └── BookingController.java      # Booking Creation, Details & Cancellation (/api/bookings/*)
│
├── service/
│   ├── AuthService.java            # OTP Verification & User Auth
│   ├── OtpService.java             # Single-use 6-digit OTP generation & validation
│   ├── UserService.java            # User profile management
│   ├── BusService.java            # Bus search & seat layout retrieval
│   ├── BookingService.java        # Transactional booking, seat locking & cancellation
│   └── PaymentService.java        # Mock internal payment transaction processing
│
├── repository/
│   ├── UserRepository.java
│   ├── OtpRepository.java
│   ├── BusRepository.java
│   ├── RouteRepository.java
│   ├── BusScheduleRepository.java
│   ├── SeatRepository.java
│   ├── ScheduleSeatRepository.java# Pessimistic locking & seat reservation queries
│   ├── BookingRepository.java
│   ├── BookingPassengerRepository.java
│   └── PaymentRepository.java
│
├── entity/
│   ├── User.java                   # Customer User Entity
│   ├── Otp.java                    # OTP Storage
│   ├── Bus.java                    # Vehicle Definition
│   ├── Route.java                  # Route (Source -> Destination)
│   ├── BusSchedule.java            # Bus Journey Schedule
│   ├── Seat.java                   # Bus Seat Configuration
│   ├── ScheduleSeat.java           # Schedule-level Seat Availability
│   ├── Booking.java                # Booking Record
│   ├── BookingPassenger.java       # Relational Passenger Details
│   └── Payment.java                # Internal Mock Payment State
│
├── dto/
│   ├── common/
│   │   └── ApiResponse.java        # Generic JSON wrapper {success, message, data}
│   ├── auth/
│   │   ├── SendOtpRequest.java
│   │   ├── VerifyOtpRequest.java
│   │   └── AuthResponse.java
│   ├── user/
│   │   ├── UserResponse.java
│   │   └── UpdateUserRequest.java
│   ├── bus/
│   │   ├── BusSearchRequest.java
│   │   ├── BusSearchResponse.java
│   │   ├── BusDetailsResponse.java
│   │   └── SeatResponse.java
│   └── booking/
│       ├── CreateBookingRequest.java
│       ├── PassengerRequest.java
│       ├── PassengerResponse.java
│       ├── BookingResponse.java
│       ├── BookingDetailsResponse.java
│       └── CancelBookingResponse.java
│
├── exception/
│   ├── GlobalExceptionHandler.java # Centralized @RestControllerAdvice error handler
│   ├── InvalidOtpException.java
│   ├── SeatUnavailableException.java
│   ├── BookingException.java
│   └── ResourceNotFoundException.java
│
├── mapper/
│   ├── UserMapper.java
│   ├── BusMapper.java
│   └── BookingMapper.java
│
├── config/
│   └── DataSeeder.java            # Automatic seed data initializer (CommandLineRunner)
│
└── util/
    └── OtpGenerator.java           # Secure 6-digit numeric OTP generator
```

---

## 🗄️ Database Tables & Relationships

Database: `aibus_db`

1. `users` (`id`, `mobile` [UNIQUE], `name`, `created_at`, `updated_at`)
2. `otps` (`id`, `mobile`, `otp`, `expires_at`, `used`)
3. `buses` (`id`, `bus_number` [UNIQUE], `bus_name`, `bus_type`, `total_seats`, `active`)
4. `routes` (`id`, `source`, `destination`, `active`) - UNIQUE(`source`, `destination`)
5. `bus_schedules` (`id`, `bus_id`, `route_id`, `journey_date`, `departure_time`, `arrival_time`, `boarding_point`, `dropping_point`, `base_fare`, `status`)
6. `seats` (`id`, `bus_id`, `seat_number`, `seat_type`, `row_number`, `column_number`, `active`) - UNIQUE(`bus_id`, `seat_number`)
7. `schedule_seats` (`id`, `schedule_id`, `seat_id`, `status`, `booking_id`) - UNIQUE(`schedule_id`, `seat_id`)
8. `bookings` (`id`, `booking_reference` [UNIQUE], `user_id`, `schedule_id`, `total_amount`, `status`, `created_at`, `updated_at`)
9. `booking_passengers` (`id`, `booking_id`, `name`, `age`, `gender`, `seat_number`, `mobile`)
10. `payments` (`id`, `booking_id`, `amount`, `status`, `created_at`, `updated_at`)

---

## 🔌 Customer REST APIs

### 1. Auth APIs
- `POST /api/auth/send-otp`: Request body `{"mobile": "9876543210"}`
- `POST /api/auth/verify-otp`: Request body `{"mobile": "9876543210", "otp": "123456"}`

### 2. User Profile APIs
- `GET /api/users/{id}`: Returns user profile DTO.
- `PUT /api/users/{id}`: Request body `{"name": "Rahul Sharma"}`
- `GET /api/users/{id}/bookings`: Returns user booking history (newest first).

### 3. Bus Search & Availability APIs
- `GET /api/buses/search?source=Pune&destination=Mumbai&date=2026-09-25`: Returns matching available bus schedules.
- `GET /api/buses/{scheduleId}`: Returns schedule details, route, fare, and available seat counts.
- `GET /api/buses/{scheduleId}/seats`: Returns seat layout and availability (`AVAILABLE`, `BOOKED`).

### 4. Booking APIs
- `POST /api/bookings`: Create booking for selected seats and passenger details.
  ```json
  {
    "userId": 10,
    "scheduleId": 37,
    "selectedSeats": ["A1", "A2"],
    "passengers": [
      { "name": "Rahul", "age": 25, "gender": "MALE", "seatNumber": "A1", "mobile": "9876543210" },
      { "name": "Amit", "age": 24, "gender": "MALE", "seatNumber": "A2", "mobile": "9876543211" }
    ]
  }
  ```
- `GET /api/bookings/{bookingReference}`: Get booking details by reference.
- `POST /api/bookings/{bookingReference}/cancel`: Cancel booking and release seats back to `AVAILABLE`.

---

## 🛡️ Key Business Rules Implemented

1. **Duplicate Seat Protection**: Pessimistic database locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) and UNIQUE constraint `(schedule_id, seat_id)` prevent two users from booking the same seat simultaneously.
2. **Backend Total Amount Calculation**: Fare is calculated server-side (`selectedSeats.size() * baseFare`). Client-supplied amounts are never trusted.
3. **Single-Use OTP & Expiry**: OTPs expire after 5 minutes and become invalid immediately upon first use or when a new OTP is generated.
4. **Relational Passenger Storage**: Passenger records are stored as normalized relational rows linked to the `booking_id`.
5. **Atomic Transaction Management**: `@Transactional` ensures that if passenger creation or seat locking fails, the entire booking transaction rolls back cleanly.

---

## 🧪 Testing Commands

### Build & Run Tests
```bash
mvn clean test
mvn spring-boot:run
```

### Curl Test Commands

```bash
# 1. Search Buses
curl -X GET "http://localhost:8080/api/buses/search?source=Pune&destination=Mumbai&date=2026-09-25"

# 2. Get Seat Availability
curl -X GET "http://localhost:8080/api/buses/37/seats"

# 3. Create Booking
curl -X POST "http://localhost:8080/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{"userId":10,"scheduleId":37,"selectedSeats":["A1","A2"],"passengers":[{"name":"Rahul","age":25,"gender":"MALE","seatNumber":"A1","mobile":"9876543210"},{"name":"Amit","age":24,"gender":"MALE","seatNumber":"A2","mobile":"9876543211"}]}'

# 4. Cancel Booking
curl -X POST "http://localhost:8080/api/bookings/AIBUS-20260918-154287/cancel"
```
