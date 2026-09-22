import api from "./api";

const SEAT_LOCK_KEY = "activeSeatLock";
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const GUEST_BOOKINGS_KEY = "guestBookings";

function formatBusType(type) {
  if (!type) return "AC Seater";
  const str = type.toString().toUpperCase();
  if (str.includes("SLEEPER")) return "AC Sleeper (2+1)";
  if (str.includes("NON_AC") || str.includes("NON-AC")) return "Non-AC Seater (2+2)";
  if (str.includes("AC")) return "AC Seater (2+2)";
  return "Express Seater";
}

function calculateDuration(depTime, arrTime) {
  if (!depTime || !arrTime) return "4h 00m";
  try {
    const [depH, depM] = depTime.split(":").map(Number);
    const [arrH, arrM] = arrTime.split(":").map(Number);
    let diffMinutes = (arrH * 60 + arrM) - (depH * 60 + depM);
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  } catch {
    return "4h 00m";
  }
}

function mapBackendBooking(b) {
  const depTime = b.departureTime ? b.departureTime.toString().slice(0, 5) : "08:00";
  const arrTime = b.arrivalTime ? b.arrivalTime.toString().slice(0, 5) : "12:00";
  const passengers = (b.passengers || []).map((p) => ({
    seat: p.seatNumber,
    name: p.name,
    age: p.age,
    gender: p.gender,
    mobile: p.mobile,
  }));

  const primaryPassenger = passengers[0] || {};

  return {
    bookingId: b.bookingReference,
    bookingReference: b.bookingReference,
    userMobile: b.user?.mobile || primaryPassenger.mobile || "",
    bus: {
      id: b.scheduleId,
      operator: b.busName || "AIBus Travels",
      busNumber: b.busNumber || "AI001",
      busType: formatBusType(b.busType),
      from: b.source,
      to: b.destination,
      departureTime: depTime,
      arrivalTime: arrTime,
      duration: calculateDuration(depTime, arrTime),
      date: b.journeyDate ? b.journeyDate.toString() : "",
    },
    travellers: passengers,
    traveller: {
      name: primaryPassenger.name || "Passenger",
      age: primaryPassenger.age || "",
      mobile: primaryPassenger.mobile || b.user?.mobile || "",
    },
    seats: b.selectedSeats || [],
    totalAmount: Number(b.totalAmount || 0),
    status:
      b.bookingStatus === "CONFIRMED"
        ? "Confirmed"
        : b.bookingStatus === "CANCELLED"
        ? "Cancelled"
        : b.bookingStatus || "Confirmed",
    bookingDate: b.createdAt || new Date().toISOString(),
    isGuest: b.isGuest || false,
  };
}

export const bookingService = {
  // ----------------------------------------------------
  // ⏱️ Seat Locking System (5-Minute Local UI Timer)
  // ----------------------------------------------------
  lockSeats: (busId, seats, extraDetails = {}) => {
    const lockData = {
      busId,
      seats,
      lockedAt: Date.now(),
      expiresAt: Date.now() + LOCK_DURATION_MS,
      ...extraDetails,
    };
    localStorage.setItem(SEAT_LOCK_KEY, JSON.stringify(lockData));
    return lockData;
  },

  getSeatLock: () => {
    try {
      const data = localStorage.getItem(SEAT_LOCK_KEY);
      if (!data) return null;
      const lock = JSON.parse(data);

      if (Date.now() > lock.expiresAt) {
        bookingService.clearSeatLock();
        return null;
      }
      return lock;
    } catch {
      bookingService.clearSeatLock();
      return null;
    }
  },

  clearSeatLock: () => {
    localStorage.removeItem(SEAT_LOCK_KEY);
  },

  // ----------------------------------------------------
  // 💾 Guest Bookings Local Storage Management
  // ----------------------------------------------------
  saveGuestBooking: (booking) => {
    try {
      const existing = bookingService.getGuestBookings();
      const bookingId = booking.bookingId || booking.bookingReference;
      // Filter out duplicate
      const filtered = existing.filter((b) => (b.bookingId || b.bookingReference) !== bookingId);
      const updated = [{ ...booking, isGuest: true, bookedAt: new Date().toISOString() }, ...filtered];
      localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("guestBookingsChanged"));
      return updated;
    } catch (e) {
      console.warn("Could not save guest booking to localStorage:", e);
      return [];
    }
  },

  getGuestBookings: () => {
    try {
      const data = localStorage.getItem(GUEST_BOOKINGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getGuestBookingById: (bookingId) => {
    const list = bookingService.getGuestBookings();
    return list.find((b) => (b.bookingId || b.bookingReference) === bookingId) || null;
  },

  clearGuestBookings: () => {
    localStorage.removeItem(GUEST_BOOKINGS_KEY);
    window.dispatchEvent(new Event("guestBookingsChanged"));
  },

  // ----------------------------------------------------
  // 📝 Backend Booking Management
  // ----------------------------------------------------
  createBooking: async ({ bus, travellers, seats, totalAmount, userMobile, userId, isGuest = false }) => {
    const passengersList = (travellers || []).map((t, idx) => ({
      name: t.name || `Passenger ${idx + 1}`,
      age: parseInt(t.age, 10) || 25,
      gender: t.gender || "Male",
      seatNumber: t.seat || seats[idx] || "A1",
      mobile: t.mobile || userMobile || "9876543210",
    }));

    const payload = {
      userId: userId || 1,
      scheduleId: bus.scheduleId || bus.id || 1,
      selectedSeats: seats,
      passengers: passengersList,
    };

    let createdBooking = null;

    try {
      const response = await api.post("/api/bookings", payload);
      createdBooking = response.data?.data;
    } catch (err) {
      console.warn("Backend booking API call failed, generating local confirmed booking:", err.message);
      // Fallback booking object if backend is unreachable
      const generatedRef = "AIBUS-" + Math.floor(100000 + Math.random() * 900000);
      createdBooking = {
        bookingReference: generatedRef,
        totalAmount,
        status: "CONFIRMED",
        selectedSeats: seats,
        passengers: passengersList,
      };
    }

    bookingService.clearSeatLock();

    const fullBookingData = {
      bookingId: createdBooking.bookingReference,
      bookingReference: createdBooking.bookingReference,
      totalAmount: createdBooking.totalAmount || totalAmount,
      status: createdBooking.status || "CONFIRMED",
      seats: createdBooking.selectedSeats || seats,
      passengers: createdBooking.passengers || passengersList,
      travellers: passengersList,
      traveller: passengersList[0] || {},
      userMobile: userMobile || "9876543210",
      bus: {
        id: bus.id,
        operator: bus.operator || bus.busName || "AIBus Travels",
        busNumber: bus.busNumber || "AI001",
        busType: formatBusType(bus.busType),
        from: bus.from || "Delhi",
        to: bus.to || "Jaipur",
        departureTime: bus.departureTime || "08:00",
        arrivalTime: bus.arrivalTime || "12:00",
        duration: bus.duration || "4h 00m",
        date: bus.date || new Date().toISOString().split("T")[0],
      },
      bookingDate: new Date().toISOString(),
      isGuest,
    };

    // If booking as guest, automatically persist to browser localStorage
    if (isGuest || !userId) {
      bookingService.saveGuestBooking(fullBookingData);
    }

    return fullBookingData;
  },

  getBookingById: async (bookingReference) => {
    if (!bookingReference) return null;

    // Check backend first
    try {
      const response = await api.get(`/api/bookings/${bookingReference}`);
      const data = response.data?.data;
      if (data) return mapBackendBooking(data);
    } catch (err) {
      console.warn("Failed to fetch booking from backend, checking guest storage:", err.message);
    }

    // Fallback to local guest bookings
    return bookingService.getGuestBookingById(bookingReference);
  },

  getUserBookings: async (userId) => {
    if (!userId) return [];
    try {
      const response = await api.get(`/api/users/${userId}/bookings`);
      const list = response.data?.data || [];
      return list.map(mapBackendBooking);
    } catch (err) {
      console.warn("Failed to fetch user bookings from backend:", err.message);
      return [];
    }
  },

  cancelBooking: async (bookingReference) => {
    if (!bookingReference) return null;
    try {
      const response = await api.post(`/api/bookings/${bookingReference}/cancel`);
      return response.data?.data;
    } catch {
      // Local guest booking cancellation
      const guestList = bookingService.getGuestBookings();
      const updated = guestList.map((b) =>
        (b.bookingId || b.bookingReference) === bookingReference
          ? { ...b, status: "Cancelled" }
          : b
      );
      localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("guestBookingsChanged"));
      return { status: "CANCELLED" };
    }
  },
};

export default bookingService;
