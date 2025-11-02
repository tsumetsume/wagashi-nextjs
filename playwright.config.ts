import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    headless: true,
    trace: "on-first-retry",
    video: "on-first-retry",
    viewport: { width: 1920, height: 1080 }, // より大きなデスクトップサイズを固定
  },
  projects: [
    {
      name: "chromium",
      use: { 
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 }, // より大きなデスクトップサイズを確実に設定
      },
    },
  ],
  reporter: process.env.CI
    ? [
        ["list"],
        ["html", { outputFolder: "playwright-report" }],
      ]
    : "list",
})
