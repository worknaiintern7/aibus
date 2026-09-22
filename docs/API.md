# AIBus API Documentation

This document describes all REST APIs provided by the Spring Boot backend (`http://localhost:8080`) for both the Customer Frontend and the Admin Panel Frontend.

---

## 1. System Architecture & Base URLs

- **Backend Base URL**: `http://localhost:8080`
- **Customer Frontend Origin**: `http://localhost:5173`
- **Admin Frontend Origin**: `http://localhost:5174`
- **Database**: PostgreSQL (`aibus_db` on port 5432)

### Standard Response Envelope
All API endpoints return JSON conforming to `ApiResponse<T>`:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```
Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

---

## 2. Customer APIs

### 2.1 Authentication (`/api/auth`)

#### `POST /api/auth/send-otp`
- **Purpose**: Generates a 6-digit OTP for the provided mobile number and stores it in PostgreSQL.
- **Authentication**: None.
- **Request Body**:
  ```json
  {
    "mobile": "9876543210"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP generated successfully",
    "data": {
      "success": true,
      "message": "OTP generated successfully"
    }
  }
  ```

#### `POST /api/auth/verify-otp`
- **Purpose**: Verifies the OTP code for the mobile number. If verified, creates or retrieves the user record.
- **Authentication**: None.
- **Request Body**:
  ```json
  {
    "mobile": "9876543210",
    "otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "success": true,
      "message": "Login successful",
      "user": {
        "id": 1,
        "mobile": "9876543210",
        "name": "AIBus User"
      }
    }
  }
  ```

---

### 2.2 Buses & Schedules (`/api/buses`)

#### `GET /api/buses/search`
- **Purpose**: Searches available bus schedules by source, destination, and journey date.
- **Authentication**: None.
- **Query Parameters**:
  - `source` (String, required): e.g. "Pune"
  - `destination` (String, required): e.g. "Mumbai"
  - `date` (ISO Date YYYY-MM-DD, required): e.g. "2026-09-25"
- **Response**:
  ```json
  {
    "success": true,
    "message": "Buses retrieved successfully",
    "data": [
      {
        "scheduleId": 1,
        "busId": 1,
        "busName": "AIBus Express",
        "busNumber": "AI001",
        "busType": "AC_SEATER",
        "source": "Pune",
        "destination": "Mumbai",
        "journeyDate": "2026-09-25",
        "departureTime": "08:00:00",
        "arrivalTime": "12:00:00",
        "boardingPoint": "Pune Central Bus Station",
        "droppingPoint": "Mumbai Main Bus Stand",
        "fare": 500.00,
        "availableSeats": 20
      }
    ]
  }
  ```

#### `GET /api/buses/{scheduleId}`
- **Purpose**: Retrieves full schedule details and seat layout for a given schedule ID.
- **Authentication**: None.
- **Path Variable**: `scheduleId` (Long)

#### `GET /api/buses/{scheduleId}/seats`
- **Purpose**: Retrieves live seat status (`AVAILABLE`, `BOOKED`, `BLOCKED`) for a schedule.
- **Authentication**: None.
- **Path Variable**: `scheduleId` (Long)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Seat layout retrieved successfully",
    "data": [
      {
        "seatNumber": "A1",
        "seatType": "WINDOW",
        "status": "AVAILABLE",
        "rowNumber": 1,
        "columnNumber": 1
      }
    ]
  }
  ```

---

### 2.3 Bookings (`/api/bookings`)

#### `POST /api/bookings`
- **Purpose**: Creates a new booking in PostgreSQL with pessimistic seat locking to prevent double-booking.
- **Authentication**: Customer session / user ID.
- **Request Body**:
  ```json
  {
    "userId": 1,
    "scheduleId": 1,
    "selectedSeats": ["A1", "A2"],
    "passengers": [
      {
        "name": "John Doe",
        "age": 28,
        "gender": "Male",
        "seatNumber": "A1",
        "mobile": "9876543210"
      },
      {
        "name": "Jane Doe",
        "age": 26,
        "gender": "Female",
        "seatNumber": "A2",
        "mobile": "9876543210"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Booking created successfully",
    "data": {
      "bookingReference": "AIBUS-20260919-748291",
      "status": "CONFIRMED",
      "totalAmount": 1000.00,
      "createdAt": "2026-09-19T14:30:00",
      "selectedSeats": ["A1", "A2"],
      "passengers": [...]
    }
  }
  ```

#### `GET /api/bookings/{bookingReference}`
- **Purpose**: Retrieves complete booking details for a booking reference.
- **Authentication**: Customer.

#### `POST /api/bookings/{bookingReference}/cancel`
- **Purpose**: Cancels a confirmed booking and releases seats back to `AVAILABLE`.
- **Authentication**: Customer.

---

### 2.4 Customer Profile & History (`/api/users`)

#### `GET /api/users/{id}`
- **Purpose**: Retrieves user profile by user ID.

#### `PUT /api/users/{id}`
- **Purpose**: Updates user profile (name, email, etc.).

#### `GET /api/users/{id}/bookings`
- **Purpose**: Retrieves all bookings created by the user from PostgreSQL.
- **Path Variable**: `id` (Long, User ID)

---

## 3. Admin APIs (`/api/admin/**`)

Admin endpoints require `Authorization: Bearer <admin_token>` or header `X-Admin-Token: <token>`.

### 3.1 Admin Authentication (`/api/admin/auth`)
- `POST /api/admin/auth/login`: Admin email + password verification. Returns bearer token.
- `GET /api/admin/auth/me`: Retrieves current authenticated admin profile.
- `POST /api/admin/auth/logout`: Invalidates admin session.

### 3.2 Admin Dashboard (`/api/admin/dashboard`)
- `GET /api/admin/dashboard/overview`: Returns counts of total users, total bookings, active buses, today's bookings, confirmed/cancelled counts, and revenue.

### 3.3 Admin Bus Management (`/api/admin/buses`)
- `GET /api/admin/buses?page=0&size=20`: List buses with pagination.
- `GET /api/admin/buses/{id}`: Bus details.
- `POST /api/admin/buses`: Create a new bus.
- `PUT /api/admin/buses/{id}`: Update bus details.
- `PATCH /api/admin/buses/{id}/status`: Activate or deactivate bus.
- `GET /api/admin/buses/{busId}/seats`: Seat configuration layout.
- `POST /api/admin/buses/{busId}/seats`: Add seat to layout.
- `PUT /api/admin/buses/{busId}/seats/{seatId}`: Update seat.
- `PATCH /api/admin/buses/{busId}/seats/{seatId}/status`: Toggle seat status.

### 3.4 Admin Route Management (`/api/admin/routes`)
- `GET /api/admin/routes`: List routes.
- `POST /api/admin/routes`: Create route.
- `PUT /api/admin/routes/{id}`: Update route.
- `PATCH /api/admin/routes/{id}/status`: Toggle route active status.

### 3.5 Admin Schedule Management (`/api/admin/schedules`)
- `GET /api/admin/schedules`: List bus schedules.
- `POST /api/admin/schedules`: Create schedule.
- `PUT /api/admin/schedules/{id}`: Update schedule.
- `PATCH /api/admin/schedules/{id}/status`: Change schedule status (`SCHEDULED`, `CANCELLED`, `COMPLETED`).

### 3.6 Admin Booking Management (`/api/admin/bookings`)
- `GET /api/admin/bookings`: List bookings with search and status filters.
- `GET /api/admin/bookings/{bookingReference}`: Detailed booking view.
- `POST /api/admin/bookings/{bookingReference}/cancel`: Admin-level booking cancellation.

### 3.7 Admin User Management (`/api/admin/users`)
- `GET /api/admin/users`: List registered users.
- `GET /api/admin/users/{id}`: User profile and bookings.
- `PATCH /api/admin/users/{id}/status`: Activate or suspend user.

### 3.8 Admin Reports & Audits
- `GET /api/admin/reports/revenue`: Revenue report.
- `GET /api/admin/reports/bookings`: Booking analytics.
- `GET /api/admin/audit-logs`: Admin activity audit trail.
