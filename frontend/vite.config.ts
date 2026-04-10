import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // In Electron we load the UI via file://, so assets must be relative.
  base: mode === "electron" ? "./" : "/",
}));
