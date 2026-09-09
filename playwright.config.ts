import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 1,
  reporter: "html",
  use: { baseURL: "http://127.0.0.1:3100", trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    env: {
      TRAZO_DEMO_MODE: "true",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3100",
    },
    url: "http://127.0.0.1:3100",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
