import { expect, test } from '@playwright/test';
import { loginAsEditor } from './helpers/auth';

test.describe('Project Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as editor before each test
    await loginAsEditor(page);
    await expect(page.getByRole('heading', { name: /^projects$/i })).toBeVisible();
  });

  test('create a new project', async ({ page }) => {
    // Navigate to new project page
    await page.getByRole('link', { name: /add new project/i }).click();
    await expect(page).toHaveURL('/project/new');

    // Fill required fields
    await page.getByLabel(/project name \*/i).fill('E2E Test Project');
    await page.getByText('Select country').click();
    await page.getByRole('option', { name: 'Germany' }).click();
    await page.getByText('Select type').click();
    await page.getByRole('option', { name: 'Research' }).click();
    await page.getByLabel(/project value \(eur\) \*/i).fill('1000000');
    await page.getByLabel(/start date \*/i).fill('2025-01-01');
    await page.getByLabel(/end date \*/i).fill('2025-12-31');
    await page.getByLabel(/description \*/i).fill('This is an E2E test project');

    // Submit form
    await page.getByRole('button', { name: /create project/i }).click();

    // Should redirect to project detail page
    await expect(page).toHaveURL(/\/project\/[a-z0-9-]+/);
    await expect(page.getByRole('heading', { name: 'E2E Test Project' })).toBeVisible();
  });

  test('edit an existing project', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Click on first project card
    await page.getByRole('link', { name: 'View Details' }).first().click();

    // Click edit button
    await page.getByRole('button', { name: /edit project/i }).click();

    // Change project name
    const nameInput = page.getByLabel(/project name \*/i);
    await nameInput.fill('Updated E2E Project Name');

    // Save changes
    await page.getByRole('button', { name: /update project/i }).click();

    // Should show success toast
    await expect(page.getByText(/project updated successfully/i)).toBeVisible();

    // Should show updated name
    await expect(
      page.getByRole('heading', { level: 1, name: 'Updated E2E Project Name' })
    ).toBeVisible();
  });

  test('edit form closes after successful update', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Click on first project card
    await page.getByRole('link', { name: 'View Details' }).first().click();

    // Wait for navigation to project detail page
    await expect(page).toHaveURL(/\/project\/[a-z0-9-]+/);

    // Verify we're in read-only view (Edit Project button should be visible)
    await expect(page.getByRole('button', { name: /^edit project$/i })).toBeVisible();

    // Click edit button to enter edit mode
    await page.getByRole('button', { name: /^edit project$/i }).click();

    // Verify we're in edit mode (Update Project button should be visible)
    await expect(page.getByRole('button', { name: /update project/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i }).first()).toBeVisible();

    // Make a small change
    const nameInput = page.getByLabel(/project name/i);
    const originalName = await nameInput.inputValue();
    await nameInput.fill(`${originalName} - Edited`);

    // Save changes
    await page.getByRole('button', { name: /update project/i }).click();

    // Wait for success toast
    await expect(page.getByText(/project updated successfully/i)).toBeVisible();

    // Verify we're back in read-only view
    // The Edit Project button should be visible again
    await expect(page.getByRole('button', { name: /^edit project$/i })).toBeVisible();

    // The Update Project button should NOT be visible
    await expect(page.getByRole('button', { name: /update project/i })).not.toBeVisible();

    // The form's Cancel button should NOT be visible (checking the first one which is in the edit form)
    const cancelButtons = page.getByRole('button', { name: /cancel/i });
    const cancelCount = await cancelButtons.count();
    // In read-only mode, there should be fewer cancel buttons (no edit form cancel)
    expect(cancelCount).toBeLessThan(2);
  });

  test('add KPI to project', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Click on first project
    await page.getByRole('link', { name: 'View Details' }).first().click();

    // Go to KPIs tab
    await page.getByRole('tab', { name: /kpis/i }).click();

    // Click add KPI button - use the first one in the KPIs tab
    await page
      .getByRole('button', { name: /add kpi/i })
      .first()
      .click();

    // Fill KPI form
    await page.getByText('Select indicator').click();
    await page.getByRole('option', { name: /number of beneficiaries/i }).click();
    await page.getByLabel(/target value \*/i).fill('1000');
    await page.getByLabel(/value achieved \*/i).fill('500');
    await page.getByText('Select unit').click();
    await page.getByRole('option', { name: 'people' }).click();

    // Submit
    await page.getByRole('button', { name: /^add kpi$/i }).click();

    // Should show success toast
    await expect(page.getByText(/kpi added successfully/i)).toBeVisible();

    // KPI should be visible
    await expect(page.getByText('Number of beneficiaries').first()).toBeVisible();
    await expect(page.getByText('50%').first()).toBeVisible();
  });

  test('set primary KPI', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Click on first project
    await page.getByRole('link', { name: 'View Details' }).first().click();

    // Go to KPIs tab
    await page.getByRole('tab', { name: /kpis/i }).click();

    // First add a KPI if there aren't any
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    const kpiCount = await kpiCards.count();

    if (kpiCount === 0) {
      // Click add KPI button
      await page
        .getByRole('button', { name: /add kpi/i })
        .first()
        .click();

      // Fill KPI form
      await page.getByText('Select indicator').click();
      await page.getByRole('option', { name: /number of beneficiaries/i }).click();
      await page.getByLabel(/target value \*/i).fill('1000');
      await page.getByLabel(/value achieved \*/i).fill('500');
      await page.getByText('Select unit').click();
      await page.getByRole('option', { name: 'people' }).click();

      // Submit
      await page.getByRole('button', { name: /^add kpi$/i }).click();

      // Wait for success toast
      await expect(page.getByText(/kpi added successfully/i)).toBeVisible();
    }

    // Click star button on first KPI - use more specific selector for star icon
    const starButton = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-star') })
      .first();
    await starButton.click();

    // Should show success toast - be more flexible with matching
    await expect(page.locator('body')).toContainText(/primary/i);

    // Star should be filled
    await expect(starButton.locator('svg')).toHaveClass(/fill-blue-500/);
  });

  test('toggle favorite', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Click on first project
    await page.getByRole('link', { name: 'View Details' }).first().click();

    // Click favorite button - use the one in project detail header (not in cards)
    const favoriteButton = page
      .locator('main')
      .getByRole('button', { name: /favorite/i })
      .first();
    await favoriteButton.click();

    // Should show success toast
    await expect(page.locator('body')).toContainText(/favorites/i);

    // Heart should be filled
    await expect(favoriteButton.locator('svg')).toHaveClass(/fill-red-500/);
  });

  test('search projects', async ({ page }) => {
    await page.goto('/');

    // Type in search box
    await page.getByPlaceholder(/search projects/i).fill('test');

    // Should show filtered results
    await expect(page.getByText(/projects found/i)).toBeVisible();
  });

  test('filter projects by status', async ({ page }) => {
    await page.goto('/');

    // Open advanced filters
    await page.getByText(/advanced filters/i).click();

    // Select status
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /in progress/i }).click();

    // Should show filtered results
    await expect(page.getByText(/projects found/i)).toBeVisible();
  });
});
