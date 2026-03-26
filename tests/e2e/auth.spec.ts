import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login with demo editor account', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/login');

    // Click editor demo button
    await page.getByRole('button', { name: /editor/i }).click();

    // Wait for navigation to complete
    await page.waitForURL('/');

    // Should show authenticated content (Add New Project requires auth)
    await expect(page.getByRole('link', { name: /add new project/i })).toBeVisible();

    // Should show projects heading
    await expect(page.getByRole('heading', { name: /^projects$/i })).toBeVisible();
  });

  test('login with demo viewer account', async ({ page }) => {
    await page.goto('/login');

    // Click viewer demo button
    await page.getByRole('button', { name: /viewer/i }).click();

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Should show user info in header
    await expect(page.getByTestId('app-header').getByText('Demo Viewer')).toBeVisible();
  });

  test('logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByRole('button', { name: /editor/i }).click();
    await expect(page).toHaveURL('/');

    // Click logout button
    await page.getByRole('button', { name: /logout/i }).click();

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Should not show user info
    await expect(page.getByTestId('app-header').getByText('Demo Editor')).not.toBeVisible();
  });

  test('access protected route when authenticated', async ({ page }) => {
    // Login as editor
    await page.goto('/login');
    await page.getByRole('button', { name: /editor/i }).click();

    // Navigate to new project page
    await page.goto('/project/new');

    // Should stay on page (not redirected)
    await expect(page).toHaveURL('/project/new');
    await expect(page.getByRole('heading', { name: /create new project/i })).toBeVisible();
  });

  test('redirect to login when not authenticated', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/project/new');

    // Should show authentication required message
    await expect(page.getByText(/authentication required/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /create new project/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
  });
});
