const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  timeout: 60_000,
  retries: 0,
  fullyParallel: true,
  workers: 5,

  reporter: [
    ['list'],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: true,
    }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
