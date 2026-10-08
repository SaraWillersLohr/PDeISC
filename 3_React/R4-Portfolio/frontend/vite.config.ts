import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Configura Vite, React, el puerto local y el proxy hacia la API.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://localhost:3002",
      "/uploads": "http://localhost:3002",
    },
  },
});
