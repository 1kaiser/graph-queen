import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/deployed-results.json' }]
  ],

  use: {
    // Test against deployed GitHub Pages site
    baseURL: 'https://1kaiser.github.io/graph-queen/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    launchOptions: {
      args: ['--enable-logging', '--v=1']
    }
  },

  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
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

  // No webServer needed - testing deployed site
});
