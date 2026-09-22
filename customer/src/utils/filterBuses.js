function filterBuses(buses, filters = {}, sortBy = "departure_asc") {
  let result = buses.filter((bus) => {
    // Bus Type: AC / Non AC
    const isNonAc = bus.busType.toLowerCase().includes("non ac");
    const isAc = bus.busType.toLowerCase().includes("ac") && !isNonAc;

    if (filters.acOnly && !isAc) return false;
    if (filters.nonAcOnly && !isNonAc) return false;

    // Seat Type: Sleeper / Seater
    const isSleeper = bus.busType.toLowerCase().includes("sleeper");
    const isSeater = bus.busType.toLowerCase().includes("seater");

    if (filters.sleeperOnly && !isSleeper) return false;
    if (filters.seaterOnly && !isSeater) return false;

    // Departure Time Slots
    if (filters.depTime && filters.depTime.length > 0) {
      const hour = parseInt(bus.departureTime.split(":")[0], 10);
      const matchesSlot = filters.depTime.some((slot) => {
        if (slot === "before6am") return hour < 6;
        if (slot === "6amTo12pm") return hour >= 6 && hour < 12;
        if (slot === "12pmTo6pm") return hour >= 12 && hour < 18;
        if (slot === "after6pm") return hour >= 18;
        return false;
      });
      if (!matchesSlot) return false;
    }

    // Price Range
    if (filters.maxPrice && bus.price > filters.maxPrice) {
      return false;
    }

    return true;
  });

  // Sorting logic
  result.sort((a, b) => {
    if (sortBy === "price_asc") {
      return a.price - b.price;
    }
    if (sortBy === "price_desc") {
      return b.price - a.price;
    }
    if (sortBy === "departure_asc") {
      return a.departureTime.localeCompare(b.departureTime);
    }
    if (sortBy === "duration_asc") {
      const getMins = (dur) => {
        const parts = dur.match(/\d+/g);
        if (!parts) return 0;
        const h = parseInt(parts[0] || "0", 10);
        const m = parseInt(parts[1] || "0", 10);
        return h * 60 + m;
      };
      return getMins(a.duration) - getMins(b.duration);
    }
    return 0;
  });

  return result;
}

export default filterBuses;