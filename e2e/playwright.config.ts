import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    // Every test shares the single container and its database, which is reset before each test.
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
    ],
    use: {
        baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'ui',
            testDir: './tests/ui',
            use: {...devices['Desktop Chrome']}
        },
        {
            name: 'api',
            testDir: './tests/api',
        }
    ],
})