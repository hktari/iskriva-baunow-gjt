import { test, expect } from '@playwright/test';

test.describe('Analytics Page', () => {
  test('should not have Prisma client-side errors on analytics page', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Login first (analytics requires auth)
    await page.goto('/login');
    await page.getByRole('button', { name: /editor/i }).click();

    // Navigate to analytics page
    await page.goto('/analytics');

    // Wait for the page to load
    await expect(page.getByRole('heading', { name: /analytics dashboard/i })).toBeVisible();

    // Wait a bit for any async operations to complete
    await page.waitForTimeout(2000);

    // Check for Prisma browser error
    const prismaError = consoleErrors.find(err =>
      err.includes('PrismaClient is unable to run in this browser environment')
    );

    expect(prismaError).toBeUndefined();
  });

  test('should load general analytics tab successfully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByRole('button', { name: /editor/i }).click();

    // Navigate to analytics
    await page.goto('/analytics');

    // Verify general analytics tab is active and loads
    await expect(page.getByRole('tab', { name: /general analytics/i })).toBeInViewport();
    await expect(page.getByText(/total projects/i)).toBeVisible({ timeout: 10000 });
  });

  test('should load organization analytics tab successfully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByRole('button', { name: /editor/i }).click();

    // Navigate to analytics
    await page.goto('/analytics');

    // Click on organization tab
    await page.getByRole('tab', { name: /organization analytics/i }).click();

    // Wait for content to load - look for the Organization selector card
    await expect(page.getByRole('heading', { name: /organization/i })).toBeVisible();
  });
});
