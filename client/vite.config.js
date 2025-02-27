import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["__tests__/*.test.{js,ts,jsx}"],
    setupFiles: "./setupTests.js",
    globals: true,
    coverage: {
      provider: "v8", // Or 'c8' if you prefer
      reporter: ["text", "json", "html"],
    },
  },
});
