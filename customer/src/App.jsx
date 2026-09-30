import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import SearchResults from "./pages/SearchResults/SearchResults";
import SeatSelection from "./pages/SeatSelection/SeatSelection";
import TravellerDetails from "./pages/TravellerDetails/TravellerDetails";
import BookingConfirmation from "./pages/BookingConfirmation/BookingConfirmation";
import BookingSuccess from "./pages/BookingSuccess/BookingSuccess";
import MyBookings from "./pages/MyBookings/MyBookings";
import Login from "./pages/Login/Login";
import BookingDetails from "./pages/BookingDetails/BookingDetails";
import Payment from "./pages/Payment/Payment";
import PnrStatus from "./pages/PnrStatus/PnrStatus";
import AgentRedirect from "./pages/AgentRedirect/AgentRedirect";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/seat-selection" element={<SeatSelection />} />
        <Route path="/traveller-details" element={<TravellerDetails />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking-details" element={<BookingDetails />} />
        <Route path="/pnr-status" element={<PnrStatus />} />
        {/* B2B Agent Partner Portal lives in the separate agent app (own port) */}
        <Route path="/agent/*" element={<AgentRedirect />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;