import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  timeout: 60000,
  expect: { timeout: 15000 },
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
