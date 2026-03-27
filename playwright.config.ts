import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Better for debugging flakiness
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Auto-retry on flakiness
  workers: 1,
  timeout: 30000, // Increased global timeout to give room for retries/actions
  expect: {
    timeout: 10000,
  },
  reporter: 'list',
  outputDir: 'tmp/test-results',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000, // Match expect timeout
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
