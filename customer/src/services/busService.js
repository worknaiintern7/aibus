import api from "./api";
import filterBuses from "../utils/filterBuses";

function formatBusType(type) {
  if (!type) return "AC Seater";
  const str = type.toString().toUpperCase();
  if (str.includes("SLEEPER")) return "AC Sleeper (2+1)";
  if (str.includes("NON_AC") || str.includes("NON-AC")) return "Non-AC Seater (2+2)";
  if (str.includes("AC")) return "AC Seater (2+2)";
  return "Express Seater";
}

function getLayoutType(type) {
  if (!type) return "SEATER_2_2";
  const str = type.toString().toUpperCase();
  if (str.includes("SLEEPER")) return "SLEEPER_2_1";
  return "SEATER_2_2";
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

function normalizeBoardingPoint(bp) {
  if (bp && typeof bp === "object" && bp.name) {
    return {
      name: bp.name,
      address: bp.address || bp.name,
      landmark: bp.landmark || "",
      latitude: bp.latitude != null ? Number(bp.latitude) : null,
      longitude: bp.longitude != null ? Number(bp.longitude) : null,
    };
  }
  return null;
}

function normalizeBoardingPoints(points, source) {
  if (Array.isArray(points) && points.length > 0) {
    return points.map((p, idx) => ({
      id: p.id != null ? String(p.id) : `bp-${idx}`,
      name: p.name || `${source || "Pickup"} Stop`,
      time: p.time || "",
      area: p.area || source || "",
      address: p.address || p.name || "",
      landmark: p.landmark || "",
      latitude: p.latitude != null ? Number(p.latitude) : null,
      longitude: p.longitude != null ? Number(p.longitude) : null,
    }));
  }
  return [];
}

function normalizeDroppingPoints(points, destination) {
  if (Array.isArray(points) && points.length > 0) {
    return points.map((p, idx) => ({
      id: p.id != null ? String(p.id) : `dp-${idx}`,
      name: p.name || `${destination || "Dropping"} Stop`,
      time: p.time || "",
      area: p.area || destination || "",
      address: p.address || p.name || "",
      landmark: p.landmark || "",
      latitude: p.latitude != null ? Number(p.latitude) : null,
      longitude: p.longitude != null ? Number(p.longitude) : null,
    }));
  }
  return [];
}

function mapScheduleToBus(schedule) {
  const depTime = schedule.departureTime ? schedule.departureTime.slice(0, 5) : "08:00";
  const arrTime = schedule.arrivalTime ? schedule.arrivalTime.slice(0, 5) : "12:00";
  const duration = calculateDuration(depTime, arrTime);

  // Live GDS buses have no local schedule: they are identified by the provider bus id
  const isLive = schedule.provider === "GDS";

  // Live pickup points are real operator data
  const boardingPoints = isLive
    ? mapLivePoints(schedule.boardingPoints, schedule.source)
    : normalizeBoardingPoints(schedule.boardingPoints, schedule.source);
  const droppingPoints = isLive
    ? mapLivePoints(schedule.droppingPoints, schedule.destination)
    : normalizeDroppingPoints(schedule.droppingPoints, schedule.destination);
  const defaultBp = isLive
    ? (boardingPoints[0] || null)
    : schedule.boardingPoint
    ? normalizeBoardingPoint(schedule.boardingPoint)
    : (boardingPoints[0] || null);

  return {
    id: isLive ? `${LIVE_BUS_PREFIX}${schedule.gdsBusId}` : schedule.scheduleId,
    scheduleId: schedule.scheduleId,
    provider: schedule.provider || "LOCAL",
    isLive,
    gdsBusId: schedule.gdsBusId,
    busId: schedule.busId,
    operator: schedule.busName || "",
    busNumber: schedule.busNumber || "",
    busType: formatBusType(schedule.busType),
    layoutType: getLayoutType(schedule.busType),
    from: schedule.source,
    to: schedule.destination,
    departureTime: depTime,
    arrivalTime: arrTime,
    duration,
    date: schedule.journeyDate ? schedule.journeyDate.toString() : "",
    price: Number(schedule.fare || schedule.baseFare || 0),
    availableSeats: schedule.availableSeats != null ? schedule.availableSeats : 0,
    seats: schedule.availableSeats != null ? schedule.availableSeats : 0,
    rating: schedule.rating != null ? Number(schedule.rating) : null,
    reviews: schedule.reviews || null,
    amenities: Array.isArray(schedule.amenities) ? schedule.amenities : [],
    boardingPoint: defaultBp,
    boardingPoints,
    droppingPoints,
  };
}

function mapLivePoints(points, city) {
  if (!points || !points.length) {
    const cityName = city || "City";
    return [
      {
        id: `gen-${cityName.toLowerCase().replace(/[^a-z0-9]/g, "")}-1`,
        name: `${cityName} Central Bus Stand`,
        time: "",
        area: cityName,
        address: `${cityName} Central Bus Terminal`,
        landmark: "Main Highway Bay",
        mapQuery: `${cityName} Central Bus Stand`,
      },
    ];
  }
  return points.map((p, idx) => ({
    id: p.id != null ? String(p.id) : `point-${idx}`,
    name: p.name || `${city || "City"} Stop`,
    time: p.time || "",
    area: p.area || city || "",
    address: p.address || [p.name, city].filter(Boolean).join(", "),
    landmark: p.landmark || "",
    mapQuery: [p.name, city].filter(Boolean).join(", "),
  }));
}

// Live bus with its real seat chart, dropping points and cancellation policy
function mapLiveBusDetails(details) {
  const bus = mapScheduleToBus(details);
  const decks = details.decks || [];

  const seatFares = {};
  const seatInfo = {};
  decks.forEach((deck) => {
    (deck.seats || []).forEach((seat) => {
      seatFares[seat.seatNumber] = Number(seat.fare || 0);
      seatInfo[seat.seatNumber] = seat;
    });
  });

  const hasSleeper = decks.some((deck) => (deck.seats || []).some((s) => s.seatType === "SLEEPER"));

  return {
    ...bus,
    busType: details.busLabel || bus.busType,
    layoutType: hasSleeper ? "SLEEPER_2_1" : "SEATER_2_2",
    decks,
    seatFares,
    seatInfo,
    droppingPoints: mapLivePoints(details.droppingPoints, details.destination),
    maxSeats: details.maxSeatsPerBooking || 6,
    cancellationPolicy: details.cancellationPolicy || [],
  };
}

export const LIVE_BUS_PREFIX = "gds-";

export function isLiveBusId(busId) {
  return String(busId || "").startsWith(LIVE_BUS_PREFIX);
}

// Total payable for the selected seats: real per-seat fares for live buses, flat fare otherwise
export function getSeatsTotal(bus, seatCodes = []) {
  if (!bus) return 0;
  return seatCodes.reduce((sum, code) => {
    const seatFare = bus.seatFares ? bus.seatFares[code] : undefined;
    return sum + Number(seatFare != null ? seatFare : bus.price || 0);
  }, 0);
}

export const busService = {
  // Asynchronous Search API calling backend (live API data only)
  searchBuses: async ({ from, to, date, filters, sortBy } = {}) => {
    try {
      const response = await api.get("/api/buses/search", {
        params: {
          source: from,
          destination: to,
          date,
        },
      });

      const list = response.data?.data || [];
      let results = list.map(mapScheduleToBus);

      // Apply in-memory filters & sorting on the backend results
      if (filters || sortBy) {
        results = filterBuses(results, filters, sortBy);
      }

      return results;
    } catch (err) {
      console.warn("Backend bus search error:", err.message);
      return [];
    }
  },

  // Asynchronous Get Bus Details by Schedule ID (live API data only)
  getBusById: async (scheduleId, options = {}) => {
    if (!scheduleId) return null;

    // Live GDS bus: seat chart comes straight from the provider, never from sample data
    if (isLiveBusId(scheduleId)) {
      try {
        const gdsBusId = String(scheduleId).slice(LIVE_BUS_PREFIX.length);
        const response = await api.get(`/api/gds/buses/${gdsBusId}`, {
          params: {
            source: options.from,
            destination: options.to,
            date: options.date,
          },
          timeout: 40000,
        });
        const data = response.data?.data;
        return data ? mapLiveBusDetails(data) : null;
      } catch (err) {
        console.warn("Live bus details fetch failed:", err.message);
        return null;
      }
    }

    try {
      const response = await api.get(`/api/buses/${scheduleId}`);
      const data = response.data?.data;
      if (data) {
        const bus = mapScheduleToBus({
          scheduleId: data.scheduleId,
          busId: data.busId,
          busName: data.busName,
          busNumber: data.busNumber,
          busType: data.busType,
          source: data.source,
          destination: data.destination,
          journeyDate: data.journeyDate,
          departureTime: data.departureTime,
          arrivalTime: data.arrivalTime,
          fare: data.baseFare,
          availableSeats: data.availableSeats,
          boardingPoint: data.boardingPoint,
          boardingPoints: data.boardingPoints,
          droppingPoints: data.droppingPoints,
        });

        return {
          ...bus,
          from: options.from || bus.from,
          to: options.to || bus.to,
          date: options.date || bus.date,
          seatsLayout: data.seats || [],
        };
      }
    } catch (err) {
      console.warn("Backend bus details fetch failed:", err.message);
    }

    return null;
  },

  // Get seat availability for a schedule from backend
  getSeatAvailability: async (scheduleId) => {
    if (!scheduleId) return [];
    try {
      const response = await api.get(`/api/buses/${scheduleId}/seats`);
      return response.data?.data || [];
    } catch (err) {
      console.warn("Failed to fetch seats from backend:", err.message);
      return [];
    }
  },

  // Get cities from integrated GDS API with client cache and fallback
  getCities: async (query = "") => {
    const trimmed = (query || "").trim();
    try {
      const response = await api.get("/api/gds/cities", {
        params: { query: trimmed },
        timeout: 10000,
      });
      const list = response.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (err) {
      console.warn("GDS city search API error:", err.message);
    }

    // Fallback if backend or GDS API is unavailable
    const qLower = trimmed.toLowerCase();
    const fallback = (await import("../utils/cities")).default;
    return fallback
      .filter((name) => !qLower || name.toLowerCase().includes(qLower))
      .map((name) => ({
        city: name,
        cityId: null,
        state: "",
      }));
  },
};

export default busService;
