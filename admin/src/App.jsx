import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import "./styles/admin.css";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetails from "./pages/AdminUserDetails";
import AdminBuses from "./pages/AdminBuses";
import AdminBusForm from "./pages/AdminBusForm";
import AdminBusDetails from "./pages/AdminBusDetails";
import AdminSeatConfiguration from "./pages/AdminSeatConfiguration";
import AdminRoutes from "./pages/AdminRoutes";
import AdminRouteForm from "./pages/AdminRouteForm";
import AdminSchedules from "./pages/AdminSchedules";
import AdminScheduleForm from "./pages/AdminScheduleForm";
import AdminScheduleDetails from "./pages/AdminScheduleDetails";
import AdminBookings from "./pages/AdminBookings";
import AdminBookingDetails from "./pages/AdminBookingDetails";
import AdminPayments from "./pages/AdminPayments";
import AdminReports from "./pages/AdminReports";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminProfile from "./pages/AdminProfile";

function App() {
  return (
    <AdminAuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          {/* Protected Admin Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Users */}
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/users/:id" element={<AdminUserDetails />} />
              <Route path="/admin/users/:id" element={<AdminUserDetails />} />

              {/* Buses */}
              <Route path="/buses" element={<AdminBuses />} />
              <Route path="/admin/buses" element={<AdminBuses />} />
              <Route path="/buses/new" element={<AdminBusForm />} />
              <Route path="/admin/buses/new" element={<AdminBusForm />} />
              <Route path="/buses/:id" element={<AdminBusDetails />} />
              <Route path="/admin/buses/:id" element={<AdminBusDetails />} />
              <Route path="/buses/:id/edit" element={<AdminBusForm />} />
              <Route path="/admin/buses/:id/edit" element={<AdminBusForm />} />
              <Route path="/buses/:id/seats" element={<AdminSeatConfiguration />} />
              <Route path="/admin/buses/:id/seats" element={<AdminSeatConfiguration />} />

              {/* Routes */}
              <Route path="/routes" element={<AdminRoutes />} />
              <Route path="/admin/routes" element={<AdminRoutes />} />
              <Route path="/routes/new" element={<AdminRouteForm />} />
              <Route path="/admin/routes/new" element={<AdminRouteForm />} />
              <Route path="/routes/:id/edit" element={<AdminRouteForm />} />
              <Route path="/admin/routes/:id/edit" element={<AdminRouteForm />} />

              {/* Schedules */}
              <Route path="/schedules" element={<AdminSchedules />} />
              <Route path="/admin/schedules" element={<AdminSchedules />} />
              <Route path="/schedules/new" element={<AdminScheduleForm />} />
              <Route path="/admin/schedules/new" element={<AdminScheduleForm />} />
              <Route path="/schedules/:id" element={<AdminScheduleDetails />} />
              <Route path="/admin/schedules/:id" element={<AdminScheduleDetails />} />
              <Route path="/schedules/:id/edit" element={<AdminScheduleForm />} />
              <Route path="/admin/schedules/:id/edit" element={<AdminScheduleForm />} />

              {/* Bookings & Payments */}
              <Route path="/bookings" element={<AdminBookings />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/bookings/:reference" element={<AdminBookingDetails />} />
              <Route path="/admin/bookings/:reference" element={<AdminBookingDetails />} />
              <Route path="/payments" element={<AdminPayments />} />
              <Route path="/admin/payments" element={<AdminPayments />} />

              {/* Reports, Audit & Profile */}
              <Route path="/reports" element={<AdminReports />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/profile" element={<AdminProfile />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Route>

          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </AdminAuthProvider>
);
}

export default App;
