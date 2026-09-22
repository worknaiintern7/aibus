import api from "./api";
import filterBuses from "../utils/filterBuses";
import busData from "../utils/busData";

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

function mapScheduleToBus(schedule) {
  const depTime = schedule.departureTime ? schedule.departureTime.slice(0, 5) : "08:00";
  const arrTime = schedule.arrivalTime ? schedule.arrivalTime.slice(0, 5) : "12:00";
  const duration = calculateDuration(depTime, arrTime);

  return {
    id: schedule.scheduleId,
    scheduleId: schedule.scheduleId,
    busId: schedule.busId,
    operator: schedule.busName || "AIBus Travels",
    busNumber: schedule.busNumber || "AI001",
    busType: formatBusType(schedule.busType),
    layoutType: getLayoutType(schedule.busType),
    from: schedule.source,
    to: schedule.destination,
    departureTime: depTime,
    arrivalTime: arrTime,
    duration,
    date: schedule.journeyDate ? schedule.journeyDate.toString() : "",
    price: Number(schedule.fare || schedule.baseFare || 500),
    availableSeats: schedule.availableSeats != null ? schedule.availableSeats : 20,
    seats: schedule.availableSeats != null ? schedule.availableSeats : 20,
    rating: 4.5,
    reviews: "1.2K",
    amenities: ["WiFi", "Charging", "Blanket", "Water Bottle"],
  };
}

export const busService = {
  // Asynchronous Search API calling backend
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
      console.warn("Backend bus search failed or returned error, falling back to local data if needed:", err.message);
      // Fallback for development if route is not yet seeded
      let fallback = busData.map((b) => ({
        ...b,
        from: from || b.from,
        to: to || b.to,
        date: date || b.date,
      }));
      return filterBuses(fallback, filters, sortBy);
    }
  },

  // Asynchronous Get Bus Details by Schedule ID
  getBusById: async (scheduleId, options = {}) => {
    if (!scheduleId) return null;

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

    // Fallback to local sample bus
    const localBus = busData.find((b) => String(b.id) === String(scheduleId));
    if (localBus) {
      return {
        ...localBus,
        from: options.from || localBus.from,
        to: options.to || localBus.to,
        date: options.date || localBus.date,
      };
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
};

export default busService;
