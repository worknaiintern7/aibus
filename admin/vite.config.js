import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Fail instead of drifting to 5175, which belongs to the agent app
    strictPort: true,
  },
});
