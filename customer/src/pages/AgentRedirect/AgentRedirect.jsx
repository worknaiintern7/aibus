import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AGENT_PORTAL_URL } from "../../utils/constants";

// The B2B agent portal is its own app on a separate port: /agent/... is sent there
function AgentRedirect() {
  const location = useLocation();
  const subPath = location.pathname.replace(/^\/agent/, "") || "/";
  const target = `${AGENT_PORTAL_URL}${subPath}${location.search}`;

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main style={{ minHeight: "50vh", display: "grid", placeItems: "center", padding: "40px 20px", textAlign: "center" }}>
      <p>
        Opening the Agent Partner Portal… <a href={target}>Continue</a>
      </p>
    </main>
  );
}

export default AgentRedirect;
