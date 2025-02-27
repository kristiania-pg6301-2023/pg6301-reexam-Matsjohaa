// vitest.config.ts or vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // Use jsdom for browser-like APIs
    include: ["__tests__/**/*.test.{js,ts}"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html"],
    },
  },
});
