import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import AgentHeader from "./components/AgentHeader/AgentHeader";
import AgentLanding from "./pages/AgentLanding";
import AgentRegister from "./pages/AgentRegister";
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";

// Public pages share the portal header; the dashboard brings its own agent bar
function PublicLayout() {
  return (
    <>
      <AgentHeader />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<AgentLanding />} />
          <Route path="/register" element={<AgentRegister />} />
          <Route path="/login" element={<AgentLogin />} />
        </Route>
        <Route path="/dashboard" element={<AgentDashboard />} />

        {/* Old links from when the portal lived inside the customer app under /agent */}
        <Route path="/agent" element={<Navigate to="/" replace />} />
        <Route path="/agent/register" element={<Navigate to="/register" replace />} />
        <Route path="/agent/login" element={<Navigate to="/login" replace />} />
        <Route path="/agent/dashboard" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
