import { test as baseTest, expect } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard.page';

type Fixtures = {
    dashboardPage: DashboardPage;
    resetData: void;
};

export const test = baseTest.extend<Fixtures>({
    resetData: [
        async ({ request }, use) => {
            const response = await request.post('/api/test/reset');
            expect(response.status(), 'the container must be started with ENABLE_TEST_RESET=true').toBe(204);
            await use();
        },
        { auto: true }, // Executes the reset automatically before each test
    ],
    dashboardPage: async ({ page, resetData: _ }, use) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();
        await use(dashboardPage);
    },
});

export { expect };
