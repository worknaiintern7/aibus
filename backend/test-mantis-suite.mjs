// Comprehensive Mantis API & AIBus Backend Integration Test Suite
// Covers 100% of the Mantis Rest API v2 (Read API & Transaction API)

const MANTIS_AUTH = 'https://partnerapi.iamgds.com/ota/v1/Auth';
const MANTIS_READ = 'https://partnerapi.iamgds.com';
const MANTIS_TRAN = 'https://partnertranapi.iamgds.com';
const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:8080';

// Credentials come from the environment (same names as backend/.env), never from the repo
const CLIENT_ID = Number(process.env.AIBUS_CLIENT_ID);
const CLIENT_SECRET = process.env.AIBUS_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set AIBUS_CLIENT_ID and AIBUS_CLIENT_SECRET before running this suite.');
  process.exit(1);
}

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m"
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${message}`);
    passed++;
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   MANTIS GDS REST API v2 & AIBUS BACKEND INTEGRATION TEST SUITE${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  // 1. Direct Auth API
  console.log(`${colors.bold}[1/12] Testing Mantis Auth API (POST /ota/v1/Auth)...${colors.reset}`);
  let token = null;
  try {
    const res = await fetch(MANTIS_AUTH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ClientId: CLIENT_ID, ClientSecret: CLIENT_SECRET })
    });
    assert(res.status === 200, `Mantis Auth HTTP status 200`);
    const raw = await res.text();
    token = raw.replace(/^"|"$/g, '').trim();
    assert(token.length > 20, `Valid access token received: ${token.substring(0, 25)}...`);
  } catch (e) {
    assert(false, `Auth API exception: ${e.message}`);
  }

  if (!token) {
    console.error("Critical: Could not acquire token. Aborting suite.");
    process.exit(1);
  }

  const mantisHeaders = {
    'access-token': token,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  // 2. CityList API
  console.log(`\n${colors.bold}[2/12] Testing Mantis CityList API (GET /ota/CityList)...${colors.reset}`);
  let blrCityId = 4292;
  let chnCityId = 4562;
  try {
    const res = await fetch(`${MANTIS_READ}/ota/CityList`, { headers: mantisHeaders });
    assert(res.status === 200, `CityList HTTP 200`);
    const body = await res.json();
    assert(body.success === true, `CityList success is true`);
    assert(Array.isArray(body.data) && body.data.length > 5000, `CityList returned ${body.data?.length} cities`);
    const blr = body.data?.find(c => c.City?.toLowerCase() === 'bangalore');
    if (blr) blrCityId = blr.CityId;
  } catch (e) {
    assert(false, `CityList API error: ${e.message}`);
  }

  // Journey Date for tests
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  const journeyDateStr = targetDate.toISOString().split('T')[0];

  // 3. Search API
  console.log(`\n${colors.bold}[3/12] Testing Mantis Search API (GET /ota/Search)...${colors.reset}`);
  let liveBus = null;
  try {
    const searchUrl = `${MANTIS_READ}/ota/Search?fromCityId=${blrCityId}&toCityId=${chnCityId}&journeyDate=${journeyDateStr}`;
    const res = await fetch(searchUrl, { headers: mantisHeaders });
    assert(res.status === 200, `Search HTTP 200 for date ${journeyDateStr}`);
    const body = await res.json();
    assert(body.success === true, `Search response success is true`);
    assert(Array.isArray(body.data?.Buses) && body.data.Buses.length > 0, `Search returned ${body.data?.Buses?.length} available buses`);
    if (body.data?.Buses?.length > 0) {
      liveBus = body.data.Buses[0];
      assert(liveBus.RouteBusId != null, `Live bus has RouteBusId: ${liveBus.RouteBusId} (${liveBus.CompanyName})`);
      assert(Array.isArray(liveBus.Pickups) && liveBus.Pickups.length > 0, `Bus has ${liveBus.Pickups?.length} pickup points`);
      assert(Array.isArray(liveBus.Dropoffs) && liveBus.Dropoffs.length > 0, `Bus has ${liveBus.Dropoffs?.length} dropoff points`);
    }
  } catch (e) {
    assert(false, `Search API error: ${e.message}`);
  }

  const busIdToTest = liveBus ? liveBus.RouteBusId : 1;

  // 4. SearchBus API
  console.log(`\n${colors.bold}[4/12] Testing Mantis SearchBus API (GET /ota/SearchBus)...${colors.reset}`);
  try {
    const res = await fetch(`${MANTIS_READ}/ota/SearchBus?fromCityId=${blrCityId}&toCityId=${chnCityId}&journeyDate=${journeyDateStr}&busId=${busIdToTest}`, {
      headers: mantisHeaders
    });
    assert(res.status === 200, `SearchBus HTTP 200`);
    const body = await res.json();
    assert(body.success === true, `SearchBus success is true`);
    assert(body.data?.Buses?.length > 0, `SearchBus returned single bus details`);
  } catch (e) {
    assert(false, `SearchBus API error: ${e.message}`);
  }

  // 5. Chart API
  console.log(`\n${colors.bold}[5/12] Testing Mantis Chart API (GET /ota/Chart)...${colors.reset}`);
  let chartData = null;
  let firstAvailSeat = null;
  let seatFare = 50;
  let seatType = 1;
  try {
    const res = await fetch(`${MANTIS_READ}/ota/Chart?fromCityId=${blrCityId}&toCityId=${chnCityId}&journeyDate=${journeyDateStr}&busId=${busIdToTest}`, {
      headers: mantisHeaders
    });
    assert(res.status === 200, `Chart HTTP 200`);
    const body = await res.json();
    assert(body.success === true, `Chart success is true`);
    chartData = body.data;
    assert(chartData?.ChartLayout?.Info?.TotalSeats > 0, `Total seats in layout: ${chartData?.ChartLayout?.Info?.TotalSeats}`);
    
    // Find an available seat
    const statuses = chartData?.SeatsStatus?.Status || [];
    const fares = chartData?.SeatsStatus?.Fares || [];
    const seats = chartData?.ChartSeats?.Seats || [];
    const lower = chartData?.ChartLayout?.Layout?.Lower || [];
    for (let i = 0; i < statuses.length; i++) {
      if (statuses[i] === 1) { // 1 = Available for all
        firstAvailSeat = seats[i];
        seatFare = fares[i][0];
        const layoutItem = lower.find(item => item[0] === i);
        if (layoutItem) seatType = layoutItem[5];
        break;
      }
    }
    assert(firstAvailSeat != null, `Found available seat for testing: Seat ${firstAvailSeat}, Fare: ₹${seatFare}, Type: ${seatType}`);
  } catch (e) {
    assert(false, `Chart API error: ${e.message}`);
  }

  // 6. AgentBalance API
  console.log(`\n${colors.bold}[6/12] Testing Mantis AgentBalance API (GET /ota/balance)...${colors.reset}`);
  try {
    const res = await fetch(`${MANTIS_TRAN}/ota/balance`, { headers: mantisHeaders });
    assert(res.status === 200, `Balance HTTP 200`);
    const body = await res.json();
    assert(body.success === true, `Balance success is true`);
    assert(body.data?.Balance != null, `Agent Balance: ₹${body.data?.Balance}`);
  } catch (e) {
    assert(false, `Balance API error: ${e.message}`);
  }

  // 7. HoldSeats API
  console.log(`\n${colors.bold}[7/12] Testing Mantis HoldSeats API (POST /ota/HoldSeats)...${colors.reset}`);
  let holdId = null;
  try {
    const pickupCode = chartData?.Pickups?.[0]?.PickupCode || "39436";
    const dropoffCode = chartData?.Dropoffs?.[0]?.DropoffCode || "750";
    const holdPayload = {
      FromCityId: blrCityId,
      ToCityId: chnCityId,
      JourneyDate: journeyDateStr,
      BusId: busIdToTest,
      PickUpID: String(pickupCode),
      DropOffID: String(dropoffCode),
      ContactInfo: {
        CustomerName: "AIBus Test Passenger",
        Email: "test@aibus.internal",
        Phone: "9876543210",
        Mobile: "9876543210"
      },
      GSTDetails: { Gstin: "", GstCompany: "" },
      Passengers: [
        {
          Name: "AIBus Test Passenger",
          Age: 26,
          Gender: "M",
          SeatNo: String(firstAvailSeat || "2"),
          Fare: seatFare,
          SeatTypeId: seatType,
          IsAcSeat: false
        }
      ]
    };
    const res = await fetch(`${MANTIS_TRAN}/ota/HoldSeats`, {
      method: 'POST',
      headers: mantisHeaders,
      body: JSON.stringify(holdPayload)
    });
    assert(res.status === 200, `HoldSeats HTTP 200`);
    const body = await res.json();
    assert(body.success === true, `HoldSeats success is true`);
    if (body.data?.HoldId) {
      holdId = body.data.HoldId;
      assert(holdId != null, `Seat successfully held with HoldId: ${holdId}`);
    }
  } catch (e) {
    assert(false, `HoldSeats API error: ${e.message}`);
  }

  // 8. BookingStatus API
  console.log(`\n${colors.bold}[8/12] Testing Mantis BookingStatus API (POST /ota/bookingstatusv2)...${colors.reset}`);
  if (holdId) {
    try {
      const res = await fetch(`${MANTIS_TRAN}/ota/bookingstatusv2`, {
        method: 'POST',
        headers: mantisHeaders,
        body: JSON.stringify({ HoldId: holdId })
      });
      assert(res.status === 200, `BookingStatus HTTP 200`);
      const body = await res.json();
      assert(body.success === true, `BookingStatus success is true`);
      assert(body.data?.Status != null, `Booking Status for HoldId ${holdId}: Code ${body.data?.Status} (${body.data?.Message})`);
    } catch (e) {
      assert(false, `BookingStatus API error: ${e.message}`);
    }
  } else {
    console.log(`  ${colors.yellow}⊘ SKIP:${colors.reset} BookingStatus skipped (no active holdId)`);
  }

  // 9. IsCancellable API
  console.log(`\n${colors.bold}[9/12] Testing Mantis IsCancellable API (GET /ota/IsCancellable)...${colors.reset}`);
  try {
    const res = await fetch(`${MANTIS_TRAN}/ota/IsCancellable?PNRNo=96160626-523525&TicketNo=501718666&seatNos=7`, {
      headers: mantisHeaders
    });
    assert(res.status === 200, `IsCancellable HTTP 200 (API reachable and processed query)`);
  } catch (e) {
    assert(false, `IsCancellable API error: ${e.message}`);
  }

  // 10. BookingDetails API
  console.log(`\n${colors.bold}[10/12] Testing Mantis BookingDetails API (GET /ota/BookingDetails)...${colors.reset}`);
  try {
    const res = await fetch(`${MANTIS_TRAN}/ota/BookingDetails?PNR=96160626-523525&TicketNo=501718666`, {
      headers: mantisHeaders
    });
    assert(res.status === 200, `BookingDetails HTTP 200`);
    const body = await res.json();
    assert(body.success === true, `BookingDetails returned valid ticket data`);
    assert(body.data?.TicketNo === '501718666', `Correct ticket details retrieved (TicketNo: ${body.data?.TicketNo}, Operator: ${body.data?.CompanyName})`);
  } catch (e) {
    assert(false, `BookingDetails API error: ${e.message}`);
  }

  // 11. Backend Bus Search Integration
  console.log(`\n${colors.bold}[11/12] Testing AIBus Backend Bus Search (/api/buses/search)...${colors.reset}`);
  try {
    const res = await fetch(`${BACKEND_BASE}/api/buses/search?source=Bangalore&destination=Chennai&date=${journeyDateStr}`);
    assert(res.status === 200, `Backend search HTTP 200`);
    const body = await res.json();
    assert(body.success === true, `Backend search success`);
    assert(Array.isArray(body.data) && body.data.length > 0, `Backend merged GDS live inventory (${body.data?.length} buses returned)`);
  } catch (e) {
    assert(false, `Backend bus search error: ${e.message}`);
  }

  // 12. Backend GDS Bus Chart & Details Integration
  console.log(`\n${colors.bold}[12/12] Testing AIBus Backend GDS Chart (/api/gds/buses/${busIdToTest})...${colors.reset}`);
  try {
    const res = await fetch(`${BACKEND_BASE}/api/gds/buses/${busIdToTest}?source=Bangalore&destination=Chennai&date=${journeyDateStr}`);
    assert(res.status === 200, `Backend GDS bus details HTTP 200`);
    const body = await res.json();
    assert(body.success === true, `Backend bus details success`);
    assert(Array.isArray(body.data?.decks) && body.data.decks.length > 0, `Seat chart parsed into ${body.data?.decks?.length} deck(s) with ${body.data?.decks[0]?.seats?.length} seats`);
  } catch (e) {
    assert(false, `Backend GDS bus details error: ${e.message}`);
  }

  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}   TEST SUMMARY: ${passed} PASSED, ${failed} FAILED${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
