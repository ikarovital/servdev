import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  outputDir: 'reports/test-results',

  timeout: 30 * 1000,

  expect: {
    timeout: 5000,
  },

  reporter: [
    ['html', { outputFolder: 'reports/playwright-report' }],
    ['list'],
    ['allure-playwright', { outputFolder: 'reports/allure-results-playwright' }]
  ],

  use: {
    baseURL: 'https://front.serverest.dev',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    }
  ],
});