import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fail instead of drifting to 5174 / 5175, which belong to the admin and agent apps
    strictPort: true,
    host: true,
  },
});
