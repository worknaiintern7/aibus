import api from "./api";

const SEAT_LOCK_KEY = "activeSeatLock";
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const GUEST_BOOKINGS_KEY = "guestBookings";

// Seats already held with the operator while the confirm step is retried
let pendingLiveHold = null;

const STATUS_LABELS = {
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
  FAILED: "Failed",
  COMPLETED: "Completed",
};

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
  const depTime = b.departureTime ? b.departureTime.toString().slice(0, 5) : "";
  const arrTime = b.arrivalTime ? b.arrivalTime.toString().slice(0, 5) : "";
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
    // Live (GDS) bookings carry the operator PNR and ticket number
    provider: b.provider || "LOCAL",
    isLive: b.provider === "GDS",
    pnrNo: b.pnrNo || "",
    ticketNo: b.ticketNo || "",
    boardingPoint: b.boardingPoint || "",
    boardingTime: b.boardingTime || "",
    droppingPoint: b.droppingPoint || "",
    contactEmail: b.contactEmail || "",
    refundAmount: b.refundAmount != null ? Number(b.refundAmount) : null,
    cancellationCharge: b.cancellationCharge != null ? Number(b.cancellationCharge) : null,
    userMobile: b.contactMobile || b.user?.mobile || primaryPassenger.mobile || "",
    bus: {
      id: b.scheduleId,
      operator: b.busName || "",
      busNumber: b.busNumber || "",
      busType: formatBusType(b.busType),
      from: b.source || "",
      to: b.destination || "",
      departureTime: depTime,
      arrivalTime: arrTime,
      duration: calculateDuration(depTime, arrTime),
      date: b.journeyDate ? b.journeyDate.toString() : "",
    },
    travellers: passengers,
    traveller: {
      name: primaryPassenger.name || "",
      age: primaryPassenger.age || "",
      mobile: primaryPassenger.mobile || b.user?.mobile || "",
    },
    seats: b.selectedSeats || [],
    totalAmount: Number(b.totalAmount || 0),
    status: STATUS_LABELS[b.bookingStatus] || b.bookingStatus || "Confirmed",
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
      seatNumber: t.seat || seats[idx] || "",
      mobile: t.mobile || userMobile || "",
    }));

    const payload = {
      userId: userId || null,
      scheduleId: bus.scheduleId || bus.id,
      selectedSeats: seats,
      passengers: passengersList,
    };

    const response = await api.post("/api/bookings", payload);
    const createdBooking = response.data?.data;
    if (!createdBooking) {
      throw new Error(response.data?.message || "Failed to create booking on server.");
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
      userMobile: userMobile || "",
      bus: {
        id: bus.id,
        operator: bus.operator || bus.busName || "",
        busNumber: bus.busNumber || "",
        busType: formatBusType(bus.busType),
        from: bus.from || "",
        to: bus.to || "",
        departureTime: bus.departureTime || "",
        arrivalTime: bus.arrivalTime || "",
        duration: bus.duration || "",
        date: bus.date || "",
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

  // ----------------------------------------------------
  // 🚌 Live (GDS) Booking: hold the seats, then book them
  // ----------------------------------------------------
  createLiveBooking: async ({
    bus,
    travellers,
    seats,
    pickupId,
    dropoffId,
    contactMobile,
    contactEmail,
    userId,
    isGuest = false,
  }) => {
    const holdKey = [bus.id, bus.date, seats.join(","), pickupId, dropoffId].join("|");

    // Step 1: hold the seats with the operator (skipped when a retry already holds them)
    if (!pendingLiveHold || pendingLiveHold.key !== holdKey) {
      const holdResponse = await api.post(
        "/api/gds/bookings/hold",
        {
          userId: userId || null,
          source: bus.from,
          destination: bus.to,
          journeyDate: bus.date,
          busId: bus.gdsBusId,
          pickupId,
          dropoffId,
          contactMobile,
          contactEmail: contactEmail || null,
          passengers: (travellers || []).map((t, idx) => ({
            name: t.name,
            age: parseInt(t.age, 10),
            gender: t.gender,
            seatNumber: t.seat || seats[idx],
            mobile: contactMobile,
          })),
        },
        { timeout: 60000 }
      );
      pendingLiveHold = { key: holdKey, reference: holdResponse.data?.data?.bookingReference };
    }

    // Payment collection belongs here, between hold and confirm.

    // Step 2: issue the ticket
    let confirmed;
    try {
      const confirmResponse = await api.post(
        `/api/gds/bookings/${pendingLiveHold.reference}/confirm`,
        null,
        { timeout: 90000 }
      );
      confirmed = confirmResponse.data?.data;
    } catch (err) {
      // A definite failure releases the hold reference; anything else can be retried as is
      if (/^Booking failed|can no longer be confirmed|not found/i.test(err.message || "")) {
        pendingLiveHold = null;
      }
      throw err;
    }

    pendingLiveHold = null;
    bookingService.clearSeatLock();

    const booking = { ...mapBackendBooking(confirmed), isGuest };
    if (isGuest || !userId) {
      bookingService.saveGuestBooking(booking);
    }
    return booking;
  },

  // Refund the customer would get if a live booking is cancelled right now
  getCancellationQuote: async (bookingReference) => {
    const response = await api.get(`/api/gds/bookings/${bookingReference}/cancellation`, {
      timeout: 40000,
    });
    return response.data?.data;
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
    const guestList = bookingService.getGuestBookings();
    const guestCopy = guestList.find((b) => (b.bookingId || b.bookingReference) === bookingReference);

    try {
      const response = await api.post(`/api/bookings/${bookingReference}/cancel`, null, {
        timeout: 60000,
      });
      const result = response.data?.data;
      if (guestCopy) {
        const synced = guestList.map((b) =>
          (b.bookingId || b.bookingReference) === bookingReference ? { ...b, status: "Cancelled" } : b
        );
        localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(synced));
        window.dispatchEvent(new Event("guestBookingsChanged"));
      }
      return result;
    } catch (err) {
      throw err;
    }
  },
};

export default bookingService;
