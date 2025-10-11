import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4, // Use 4 workers for parallel testing
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on', // Always record video for demos

    // Enable console log capture
    launchOptions: {
      args: ['--enable-logging', '--v=1']
    }
  },

  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use system Chrome browser
        launchOptions: {
          executablePath: '/usr/bin/google-chrome',
          args: [
            '--enable-logging',
            '--v=1',
            '--disable-dev-shm-usage',
            '--no-sandbox'
          ]
        }
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
