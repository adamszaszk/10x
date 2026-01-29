import { type PlaywrightTestConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Read from .env.test
dotenv.config({ path: ".env.test" });

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const config: PlaywrightTestConfig = {
  testDir: "./test/e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    actionTimeout: 0,
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: process.env.CI ? "npm run preview" : "npm run dev:e2e",
    port: PORT,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
