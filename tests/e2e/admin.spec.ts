import { expect, type Page, test } from '@playwright/test';

async function loginAsSuperUser(page: Page) {
  try {
    const csrfResponse = await page.request.get('/api/auth/csrf');

    if (csrfResponse.ok()) {
      const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
      const callbackResponse = await page.request.post('/api/auth/callback/credentials', {
        form: {
          csrfToken,
          email: 'admin@example.com',
          password: 'demo123',
          callbackUrl: 'http://localhost:3005/',
          json: 'true',
        },
      });

      if (callbackResponse.ok()) {
        await page.goto('/');
        await expect(page).toHaveURL('/');
        return;
      }
    }
  } catch {
    // Fall back to UI login on request-level auth errors.
  }

  // Fallback UI login if request-based auth is unavailable in current runtime.
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('demo123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('Admin Features', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
  });

  test.describe('User Management', () => {
    test('should display users page for super user', async ({ page }) => {
      await page.goto('/users');
      await expect(page.locator('h1')).toContainText('User Management');
      await expect(page.locator('text=Total Users')).toBeVisible();
    });

    test('should create a new user', async ({ page }) => {
      await page.goto('/users');

      // Click Add User button
      await page.getByRole('button', { name: 'Add User' }).click();

      // Fill in the form
      await page.getByLabel('Name').fill('Test User');
      await page.getByLabel('Email').fill(`test-${Date.now()}@example.com`);
      await page.getByLabel('Password', { exact: false }).fill('testpass123');

      // Submit form
      await page.getByRole('button', { name: 'Create User' }).click();

      // Wait for success message
      await expect(page.getByText('User created successfully')).toBeVisible();
    });

    test('should invite a user', async ({ page }) => {
      test.skip(
        !process.env.RESEND_API_KEY,
        'Skipping invite flow until RESEND_API_KEY is configured'
      );

      await page.goto('/users');

      // Click Invite User button
      await page.getByRole('button', { name: 'Invite User' }).click();

      // Fill in the form
      await page.getByLabel('Name').fill('Invited User');
      await page.getByLabel('Email').fill(`invited-${Date.now()}@example.com`);

      // Submit form
      await page.getByRole('button', { name: 'Send Invitation' }).click();

      // Wait for success dialog
      await expect(page.getByText('Invitation Sent Successfully')).toBeVisible();
    });

    test('should search users', async ({ page }) => {
      await page.goto('/users');

      // Type in search box
      await page.fill('input[placeholder="Search users..."]', 'admin');

      // Verify filtered results
      await expect(page.locator('table tbody tr')).toHaveCount(1);
    });

    test('should update user status', async ({ page }) => {
      await page.goto('/users');

      // Find first user row and click actions menu
      await page.locator('table tbody tr').first().locator('button[aria-haspopup="menu"]').click();

      // Click Set Inactive
      await page.click('text=Set Inactive');

      // Wait for success message
      await expect(page.locator('text=User status updated')).toBeVisible();
    });
  });

  test.describe('Field Configuration', () => {
    test('should display fields page', async ({ page }) => {
      await page.goto('/fields');
      await expect(page.locator('h1')).toContainText('Field Configuration');
      await expect(page.locator('main')).toContainText('Project Types');
    });

    test('should add a new field value', async ({ page }) => {
      await page.goto('/fields');

      // Find Project Types card and click Add button
      const projectTypesCard = page
        .locator('section, div.card, div.rounded-xl')
        .filter({ hasText: 'Project Types' });
      await projectTypesCard.getByRole('button', { name: /Add Project Type/i }).click();

      // Type new value
      const newValue = `Test Type ${Date.now()}`;
      await page.keyboard.type(newValue);

      // Press Enter to save
      await page.keyboard.press('Enter');

      // Wait for success message
      await expect(page.getByText('Field added successfully')).toBeVisible();
    });

    test('should edit a field value', async ({ page }) => {
      await page.goto('/fields');

      // Find Project Types card
      const projectTypesCard = page
        .locator('section, div.card, div.rounded-xl')
        .filter({ hasText: 'Project Types' });

      // Add a field first to make edit deterministic
      const originalValue = `Edit Test ${Date.now()}`;
      const updatedValue = `${originalValue} Updated`;
      await projectTypesCard.getByRole('button', { name: /Add Project Type/i }).click();
      await page.keyboard.type(originalValue);
      await page.keyboard.press('Enter');
      await expect(page.getByText('Field added successfully')).toBeVisible();

      // Find created field row and click edit (first icon button)
      const fieldRow = projectTypesCard.locator('div').filter({ hasText: originalValue }).first();
      await fieldRow.locator('button').first().click();

      // Update value and save via Enter
      const editInput = fieldRow.locator('input');
      await editInput.fill(updatedValue);
      await editInput.press('Enter');

      // Wait for success message
      await expect(page.getByText('Field updated successfully')).toBeVisible();
    });

    test('should delete a field value', async ({ page }) => {
      await page.goto('/fields');

      // Find Project Types card
      const projectTypesCard = page
        .locator('section, div.card, div.rounded-xl')
        .filter({ hasText: 'Project Types' });

      // Add a field first
      await projectTypesCard.getByRole('button', { name: /Add Project Type/i }).click();
      const testValue = `Delete Test ${Date.now()}`;
      await page.keyboard.type(testValue);
      await page.keyboard.press('Enter');
      const fieldRow = projectTypesCard
        .locator('div.flex.items-center.gap-2.p-2.rounded-md')
        .filter({ hasText: testValue })
        .first();
      await expect(fieldRow).toBeVisible();

      // Find and delete the field
      await fieldRow.locator('button').nth(1).click();

      // Confirm deletion
      await page.getByRole('button', { name: 'Delete' }).click();

      await expect(fieldRow).not.toBeVisible();
    });
  });

  test.describe('Audit Logs', () => {
    test('should display audit logs page', async ({ page }) => {
      await page.goto('/audit-logs');
      await expect(page.locator('h1')).toContainText('Audit Logs');
      await expect(page.locator('text=Total Events')).toBeVisible();
    });

    test('should filter audit logs by action', async ({ page }) => {
      await page.goto('/audit-logs');

      // Open action filter dropdown
      await page.getByRole('combobox').first().click();

      // Select a specific action from the dropdown
      // Using getByRole('option') or similar if it's a Radix Select
      await page.getByRole('option', { name: 'USER CREATED' }).click();

      // Verify table is filtered
      await expect(page.locator('table tbody tr')).toHaveCount(1);
    });

    test('should search audit logs', async ({ page }) => {
      await page.goto('/audit-logs');

      // Type in search box
      await page.getByPlaceholder('Search logs...').fill('admin');

      // Verify filtered results
      const rows = page.locator('table tbody tr');
      await expect(rows.first()).toBeVisible();
    });

    test('should view audit log details', async ({ page }) => {
      await page.goto('/audit-logs');

      // Click on first log entry's details button (ChevronDown)
      await page
        .locator('table tbody tr')
        .first()
        .locator('button')
        .filter({ has: page.locator('svg.lucide-chevron-down') })
        .click();

      // Verify dialog is open
      await expect(page.getByRole('heading', { name: 'Audit Log Details' })).toBeVisible();
      await expect(
        page.getByText('Action', { exact: true }).filter({ hasNot: page.locator('h1, h2, h3, p') })
      ).toBeVisible();
      await expect(page.getByText('Entity Type', { exact: true })).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should show admin menu items for super user', async ({ page }) => {
      await page.goto('/');

      // Verify admin navigation items are visible
      await expect(page.locator('nav >> text=Users')).toBeVisible();
      await expect(page.locator('nav >> text=Fields')).toBeVisible();
      await expect(page.locator('nav >> text=Audit Logs')).toBeVisible();
    });

    test('should navigate between admin pages', async ({ page }) => {
      await page.goto('/');

      // Navigate to Users
      await page.click('nav >> text=Users');
      await expect(page).toHaveURL('/users');

      // Navigate to Fields
      await page.click('nav >> text=Fields');
      await expect(page).toHaveURL('/fields');

      // Navigate to Audit Logs
      await page.click('nav >> text=Audit Logs');
      await expect(page).toHaveURL('/audit-logs');
    });
  });

  test.describe('Access Control', () => {
    test('should deny access to non-super users', async ({ page }) => {
      // Navigate to home first to ensure we can see the logout button
      await page.goto('/');

      // Logout
      await page.getByRole('button', { name: /logout/i }).click();

      // Login as editor using demo button
      await page.goto('/login');
      await page.getByRole('button', { name: 'Editor' }).click();
      await expect(page).toHaveURL('/');

      // Verify admin menu items are not visible
      await expect(page.locator('nav').getByText('Users')).not.toBeVisible();
      await expect(page.locator('nav').getByText('Fields')).not.toBeVisible();
      await expect(page.locator('nav').getByText('Audit Logs')).not.toBeVisible();

      // Try to access users page directly
      await page.goto('/users');

      // Should be redirected or see unauthorized
      await expect(page).not.toHaveURL('/users');
    });
  });
});
