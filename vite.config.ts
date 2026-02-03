/// <reference types="node" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    port: 6868,
    host: "0.0.0.0",  // Changed from "127.0.0.1" to "0.0.0.0"
  },
  preview: {
    host: '0.0.0.0',
    port: 6868,
    allowedHosts: [
      'college.checkall.org',
      'localhost',
      '127.0.0.1'
    ]
  },
});