import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:1420',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for Tauri deployment targets */
  projects: [
    // Tauri Desktop Projects (Windows WebView2, macOS WebKit, Linux WebKitGTK)
    {
      name: 'Tauri Desktop Chromium - Small',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'Tauri Desktop Chromium - Standard', 
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Tauri Desktop Chromium - Large',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'Tauri Desktop WebKit - Small',
      use: { ...devices['Desktop Safari'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'Tauri Desktop WebKit - Standard',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Tauri Desktop WebKit - Large',
      use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } },
    },

    // Tauri Mobile Projects (Android WebView, iOS WebKit)
    {
      name: 'Tauri Mobile Android - Small',
      use: { ...devices['Galaxy S5'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'Tauri Mobile Android - Large',
      use: { ...devices['Galaxy S5'], viewport: { width: 428, height: 926 } },
    },
    {
      name: 'Tauri Mobile iOS - Small',
      use: { ...devices['iPhone 12'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'Tauri Mobile iOS - Large',
      use: { ...devices['iPhone 12'], viewport: { width: 428, height: 926 } },
    },

    // Cross-platform for good measure (Desktop Firefox, Mobile Firefox)
    {
      name: 'Tauri Desktop Firefox - Small',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'Tauri Desktop Firefox - Standard',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Tauri Desktop Firefox - Large',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'Tauri Mobile Firefox - Small',
      use: { ...devices['Desktop Firefox'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'Tauri Mobile Firefox - Large',
      use: { ...devices['Desktop Firefox'], viewport: { width: 428, height: 926 } },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
  },
}); 