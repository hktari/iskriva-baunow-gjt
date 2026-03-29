import { expect, test } from '@playwright/test';

test.describe('Viewer Permissions', () => {
  test.beforeEach(async ({ page }) => {
    // Login as viewer before each test
    await page.goto('/login');
    await page.getByRole('button', { name: /viewer/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('cannot see add project button', async ({ page }) => {
    await page.goto('/');

    // Should not have add project button
    await expect(page.getByRole('link', { name: /add new project/i })).not.toBeVisible();
  });

  test('cannot access new project page', async ({ page }) => {
    // Try to access new project page directly
    await page.goto('/project/new');

    await expect(page.getByText(/Authentication Required/i)).toBeVisible();
  });

  test('can view project details', async ({ page }) => {
    await page.goto('/');

    // Click on first project
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

    // Should see project details
    await expect(page.getByRole('heading').first()).toBeVisible();

    // Should see tabs
    await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /kpis/i })).toBeVisible();
  });

  test('cannot see edit button on project', async ({ page }) => {
    await page.goto('/');

    // Click on first project
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

    // Should not see edit button
    await expect(page.getByRole('button', { name: /edit project/i })).not.toBeVisible();
  });

  test('cannot see add KPI button', async ({ page }) => {
    await page.goto('/');

    // Click on first project
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

    // Go to KPIs tab
    await page.getByRole('tab', { name: /kpis/i }).click();

    // Should not see add KPI button
    await expect(page.getByRole('button', { name: /add kpi/i })).not.toBeVisible();
  });

  test('cannot see edit/delete buttons on KPIs', async ({ page }) => {
    await page.goto('/');

    // Click on first project
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

    // Go to KPIs tab
    await page.getByRole('tab', { name: /kpis/i }).click();

    // Should not see edit or delete buttons on KPI cards
    await expect(page.getByRole('button', { name: /pencil/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /trash/i })).not.toBeVisible();
  });

  test('can toggle favorites', async ({ page }) => {
    await page.goto('/');

    // Click on first project
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

    // Should see favorite button
    const favoriteButton = page.getByRole('button', { name: /Add to favorites/i }).first();
    await expect(favoriteButton).toBeVisible();

    // Can toggle favorite
    await favoriteButton.click();
    await expect(page.getByText(/Added to favorites/i)).toBeVisible();
  });

  test('can filter by favorites', async ({ page }) => {
    await page.goto('/');

    // Should see favorites filter
    await expect(page.getByRole('checkbox', { name: /favorites only/i })).toBeVisible();

    // Can toggle filter
    await page.getByRole('checkbox', { name: /favorites only/i }).click();

    // Wait for URL to update with favoritesOnly parameter
    await expect(page).toHaveURL(/favoritesOnly=true/);
    await expect(page.getByText(/projects found/i)).toBeVisible();
  });

  test('can search and filter projects', async ({ page }) => {
    await page.goto('/');

    // Can use search
    await page.getByPlaceholder(/search projects/i).fill('test');
    await expect(page.getByText(/projects found/i)).toBeVisible();

    // Can use advanced filters
    await page.getByText(/advanced filters/i).click();
    await page.getByRole('combobox', { name: /country/i }).click();
    await page.getByRole('option', { name: 'Germany' }).click();
  });
});
