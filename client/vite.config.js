import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  // Allow tunnel/preview hosts (e.g. *.trycloudflare.com) so a public demo can be served.
  preview: {
    allowedHosts: true,
  },
});
