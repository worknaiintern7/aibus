import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Customer runs on 5173, admin on 5174. The customer app redirects /agent here,
    // so the port must not silently change when it is busy.
    port: 5175,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 5175,
    strictPort: true,
  },
});
