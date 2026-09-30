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

function normalizeBoardingPoint(bp, source) {
  if (bp && typeof bp === "object" && bp.name) {
    return {
      name: bp.name,
      address: bp.address || `${bp.name}, ${source || "City Center"}`,
      landmark: bp.landmark || "Near Main Bus Stand Gate",
      latitude: bp.latitude != null ? Number(bp.latitude) : 18.5308,
      longitude: bp.longitude != null ? Number(bp.longitude) : 73.8475,
    };
  }

  const s = (source || "").trim().toLowerCase();
  if (s.includes("pune")) {
    return {
      name: "Shivajinagar Bus Stand",
      address: "Shivajinagar, Pune, Maharashtra 411005",
      landmark: "Near Main Bus Stand Gate, Opp Metro Station",
      latitude: 18.5308,
      longitude: 73.8475,
    };
  }
  if (s.includes("mumbai")) {
    return {
      name: "Dadar TT Circle Bus Stop",
      address: "Dadar East, Mumbai, Maharashtra 400014",
      landmark: "Near Swaminarayan Temple, Flyover Pillar 24",
      latitude: 19.0178,
      longitude: 72.8478,
    };
  }
  if (s.includes("nashik")) {
    return {
      name: "CBS Bus Stand (Thakkar Bazaar)",
      address: "Thakkar Bazaar, Nashik, Maharashtra 422002",
      landmark: "Near Main Entrance, Counter No. 3",
      latitude: 19.9975,
      longitude: 73.7898,
    };
  }
  if (s.includes("goa")) {
    return {
      name: "Panjim Kadamba Bus Terminal",
      address: "Patto Plaza, Panaji, Goa 403001",
      landmark: "Near KTC Central Office Gate",
      latitude: 15.4989,
      longitude: 73.8370,
    };
  }
  if (s.includes("bengaluru") || s.includes("bangalore")) {
    return {
      name: "Majestic Kempegowda Bus Station",
      address: "Gubbi Thotadappa Rd, Majestic, Bengaluru, Karnataka 560009",
      landmark: "Opposite Sangam Theatre, Platform 3",
      latitude: 12.9778,
      longitude: 77.5713,
    };
  }

  const city = source || "City";
  return {
    name: `${city} Central Bus Stand`,
    address: `${city} Central Bus Terminal, Station Road`,
    landmark: "Near Main Entrance Gate",
    latitude: 18.5204,
    longitude: 73.8567,
  };
}

function normalizeBoardingPoints(points, source) {
  if (Array.isArray(points) && points.length > 0) {
    return points.map((p, idx) => ({
      id: p.id || `bp-${idx}`,
      name: p.name,
      time: p.time || "08:00 AM",
      area: p.area || source || "Pickup Point",
      address: p.address || `${p.name}, ${source || "City Center"}`,
      landmark: p.landmark || "Near Main Gate",
      latitude: p.latitude != null ? Number(p.latitude) : 18.5308,
      longitude: p.longitude != null ? Number(p.longitude) : 73.8475,
    }));
  }

  const s = (source || "").trim().toLowerCase();
  if (s.includes("pune")) {
    return [
      {
        id: "pune-1",
        name: "Shivajinagar Bus Stand",
        time: "08:00 AM",
        area: "Central Pune",
        address: "Shivajinagar, Pune, Maharashtra 411005",
        landmark: "Near Main Bus Stand Gate, Opp Metro Station",
        latitude: 18.5308,
        longitude: 73.8475,
      },
      {
        id: "pune-2",
        name: "Swargate Bus Stand",
        time: "07:30 AM",
        area: "South Pune",
        address: "Jedhe Chowk, Swargate, Pune, Maharashtra 411042",
        landmark: "Near Swargate Police Station, Platform 2",
        latitude: 18.5018,
        longitude: 73.8586,
      },
      {
        id: "pune-3",
        name: "Wakad / Hinjawadi Bridge",
        time: "08:35 AM",
        area: "IT Hub & Expressway",
        address: "Wakad Flyover, Mumbai-Pune Expressway, Pune 411057",
        landmark: "Under Hinjawadi Flyover, Near Ginger Hotel",
        latitude: 18.5987,
        longitude: 73.7601,
      },
      {
        id: "pune-4",
        name: "Nigdi - Pavana Setu",
        time: "08:55 AM",
        area: "PCMC / North Pune",
        address: "Nigdi, Pimpri-Chinchwad, Pune 411044",
        landmark: "Near Pavana Sahakari Bank, Highway Exit",
        latitude: 18.6534,
        longitude: 73.7667,
      },
    ];
  }
  if (s.includes("mumbai")) {
    return [
      {
        id: "mum-1",
        name: "Dadar TT Circle Bus Stop",
        time: "06:30 AM",
        area: "Central Mumbai",
        address: "Dadar East, Mumbai, Maharashtra 400014",
        landmark: "Near Swaminarayan Temple, Flyover Pillar 24",
        latitude: 19.0178,
        longitude: 72.8478,
      },
      {
        id: "mum-2",
        name: "Sion Circle (Cinemax)",
        time: "06:45 AM",
        area: "Sion / GTB",
        address: "Sion East, Mumbai 400022",
        landmark: "Opposite Cinemax Theatre, Under Flyover",
        latitude: 19.0390,
        longitude: 72.8619,
      },
      {
        id: "mum-3",
        name: "Vashi Highway Bridge",
        time: "07:15 AM",
        area: "Navi Mumbai",
        address: "Vashi Toll Plaza, Navi Mumbai 400703",
        landmark: "Opposite Center One Mall, Highway Stop",
        latitude: 19.0634,
        longitude: 72.9984,
      },
      {
        id: "mum-4",
        name: "Borivali East (National Park)",
        time: "06:00 AM",
        area: "Western Suburbs",
        address: "WEH, Borivali East, Mumbai 400066",
        landmark: "Near Sanjay Gandhi National Park Main Gate",
        latitude: 19.2291,
        longitude: 72.8574,
      },
    ];
  }
  if (s.includes("nashik")) {
    return [
      {
        id: "nsk-1",
        name: "CBS Thakkar Bazaar Stand",
        time: "07:00 AM",
        area: "City Center",
        address: "Thakkar Bazaar, Nashik, Maharashtra 422002",
        landmark: "Near Main Entrance, Counter No. 3",
        latitude: 19.9975,
        longitude: 73.7898,
      },
      {
        id: "nsk-2",
        name: "Dwarka Circle",
        time: "07:20 AM",
        area: "Dwarka Junction",
        address: "Dwarka Circle, Pune-Nashik Highway, Nashik 422011",
        landmark: "Under Dwarka Flyover, Near Hotel Dwarka",
        latitude: 19.9882,
        longitude: 73.8055,
      },
      {
        id: "nsk-3",
        name: "Mumbai Naka",
        time: "07:35 AM",
        area: "Mumbai Naka",
        address: "Mumbai Naka, Nashik, Maharashtra 422001",
        landmark: "Opposite Hotel Panchavati Yatri",
        latitude: 19.9863,
        longitude: 73.7821,
      },
    ];
  }
  if (s.includes("goa")) {
    return [
      {
        id: "goa-1",
        name: "Panjim Kadamba Bus Terminal",
        time: "08:00 AM",
        area: "Panaji",
        address: "Patto Plaza, Panaji, Goa 403001",
        landmark: "Near KTC Central Office Gate",
        latitude: 15.4989,
        longitude: 73.8370,
      },
      {
        id: "goa-2",
        name: "Mapusa KTC Bus Stand",
        time: "07:30 AM",
        area: "North Goa",
        address: "Mapusa, Goa 403507",
        landmark: "Near Mapusa Market Entrance",
        latitude: 15.5925,
        longitude: 73.8136,
      },
      {
        id: "goa-3",
        name: "Margao Kadamba Terminal",
        time: "08:45 AM",
        area: "South Goa",
        address: "Margao, Goa 403601",
        landmark: "Platform 4, Near RTO Office",
        latitude: 15.2832,
        longitude: 73.9663,
      },
    ];
  }
  if (s.includes("bengaluru") || s.includes("bangalore")) {
    return [
      {
        id: "blr-1",
        name: "Majestic Kempegowda Station",
        time: "09:00 PM",
        area: "Central Bengaluru",
        address: "Gubbi Thotadappa Rd, Majestic, Bengaluru 560009",
        landmark: "Opposite Sangam Theatre, Platform 3",
        latitude: 12.9778,
        longitude: 77.5713,
      },
      {
        id: "blr-2",
        name: "Madiwala Total Mall",
        time: "09:30 PM",
        area: "Madiwala",
        address: "Madiwala Junction, Bengaluru 560068",
        landmark: "Near St. John's Hospital Junction",
        latitude: 12.9226,
        longitude: 77.6200,
      },
      {
        id: "blr-3",
        name: "Electronic City Toll Gate",
        time: "09:45 PM",
        area: "Electronic City",
        address: "Hosur Road, Bengaluru 560100",
        landmark: "Elevated Expressway Toll Gate, Pillar 105",
        latitude: 12.8452,
        longitude: 77.6602,
      },
    ];
  }

  const city = source || "City";
  return [
    {
      id: "gen-1",
      name: `${city} Central Bus Stand`,
      time: "08:00 AM",
      area: `${city} Center`,
      address: `${city} Central Bus Terminal, Station Road`,
      landmark: "Near Main Entrance Gate",
      latitude: 18.5204,
      longitude: 73.8567,
    },
    {
      id: "gen-2",
      name: `${city} Railway Station Bus Bay`,
      time: "08:25 AM",
      area: "Station Area",
      address: `Station Road, ${city}`,
      landmark: "Opposite Railway Platform 1 Exit",
      latitude: 18.5284,
      longitude: 73.8744,
    },
  ];
}

function mapScheduleToBus(schedule) {
  const depTime = schedule.departureTime ? schedule.departureTime.slice(0, 5) : "08:00";
  const arrTime = schedule.arrivalTime ? schedule.arrivalTime.slice(0, 5) : "12:00";
  const duration = calculateDuration(depTime, arrTime);
  const boardingPoints = normalizeBoardingPoints(schedule.boardingPoints, schedule.source);
  const defaultBp = schedule.boardingPoint
    ? normalizeBoardingPoint(schedule.boardingPoint, schedule.source)
    : (boardingPoints[0] || null);

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
    boardingPoint: defaultBp,
    boardingPoints,
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
      let fallback = busData.map((b) => {
        const points = normalizeBoardingPoints(b.boardingPoints, from || b.from);
        return {
          ...b,
          from: from || b.from,
          to: to || b.to,
          date: date || b.date,
          boardingPoint: points[0] || normalizeBoardingPoint(b.boardingPoint, from || b.from),
          boardingPoints: points,
        };
      });
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
