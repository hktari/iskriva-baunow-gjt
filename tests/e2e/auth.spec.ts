import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login with demo editor account', async ({ page }) => {
    await page.goto('/login');

    // Click editor demo button
    await page.getByRole('button', { name: /editor/i }).click();

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Should show user info in header
    await expect(page.getByRole('banner').getByText(/editor/i)).toBeVisible();
  });

  test('login with demo viewer account', async ({ page }) => {
    await page.goto('/login');

    // Click viewer demo button
    await page.getByRole('button', { name: /viewer/i }).click();

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Should show user info in header
    await expect(page.getByRole('banner').getByText(/viewer/i)).toBeVisible();
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
    await expect(page.getByRole('banner').getByText(/editor/i)).not.toBeVisible();
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

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
