import { expect, test } from '@playwright/test';

test.describe('Project Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as editor before each test
    await page.goto('/login');
    await page.getByRole('button', { name: /editor/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('create a new project', async ({ page }) => {
    // Navigate to new project page
    await page.getByRole('link', { name: /add new project/i }).click();
    await expect(page).toHaveURL('/project/new');

    // Fill required fields
    await page.getByLabel(/project name/i).fill('E2E Test Project');
    await page.getByLabel(/country/i).click();
    await page.getByRole('option', { name: 'Germany' }).click();
    await page.getByLabel(/project type/i).click();
    await page.getByRole('option', { name: 'Research' }).click();
    await page.getByLabel(/project value/i).fill('1000000');
    await page.getByLabel(/start date/i).fill('2025-01-01');
    await page.getByLabel(/description/i).fill('This is an E2E test project');

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
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

    // Click edit button
    await page.getByRole('button', { name: /edit project/i }).click();

    // Change project name
    const nameInput = page.getByLabel(/project name/i);
    await nameInput.fill('Updated E2E Project Name');

    // Save changes
    await page.getByRole('button', { name: /update project/i }).click();

    // Should show success toast
    await expect(page.getByText(/project updated successfully/i)).toBeVisible();

    // Should show updated name
    await expect(page.getByRole('heading', { name: 'Updated E2E Project Name' })).toBeVisible();
  });

  test('edit form closes after successful update', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Click on first project card
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

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
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

    // Go to KPIs tab
    await page.getByRole('tab', { name: /kpis/i }).click();

    // Click add KPI button
    await page.getByRole('button', { name: /add kpi/i }).click();

    // Fill KPI form
    await page.getByLabel(/indicator name/i).click();
    await page.getByRole('option', { name: /number of beneficiaries/i }).click();
    await page.getByLabel(/target value/i).fill('1000');
    await page.getByLabel(/value achieved/i).fill('500');
    await page.getByLabel(/^unit$/i).click();
    await page.getByRole('option', { name: 'people' }).click();

    // Submit
    await page.getByRole('button', { name: /^add kpi$/i }).click();

    // Should show success toast
    await expect(page.getByText(/kpi added successfully/i)).toBeVisible();

    // KPI should be visible
    await expect(page.getByText('Number of beneficiaries')).toBeVisible();
    await expect(page.getByText('50%')).toBeVisible();
  });

  test('set primary KPI', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Click on first project
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

    // Go to KPIs tab
    await page.getByRole('tab', { name: /kpis/i }).click();

    // Click star button on first KPI
    const starButton = page.getByRole('button', { name: /star/i }).first();
    await starButton.click();

    // Should show success toast
    await expect(page.getByText(/set as primary kpi/i)).toBeVisible();

    // Star should be filled
    await expect(starButton.locator('svg')).toHaveClass(/fill-blue-500/);
  });

  test('toggle favorite', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Click on first project
    await page
      .getByRole('link', { name: /view details/i })
      .first()
      .click();

    // Click favorite button
    const favoriteButton = page.getByRole('button', { name: /favorite/i });
    await favoriteButton.click();

    // Should show success toast
    await expect(page.getByText(/added to favorites/i)).toBeVisible();

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
