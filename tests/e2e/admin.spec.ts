import { expect, test } from '@playwright/test';

test.describe('Admin Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login as super user using demo button
    await page.goto('/login');
    await page.getByRole('button', { name: 'Super User' }).click();
    await expect(page).toHaveURL('/');
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
      await page.click('button:has-text("Add User")');

      // Fill in the form
      await page.fill('input[id="name"]', 'Test User');
      await page.fill('input[id="email"]', `test-${Date.now()}@example.com`);
      await page.fill('input[id="password"]', 'testpass123');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for success message
      await expect(page.locator('text=User created successfully')).toBeVisible({ timeout: 5000 });
    });

    test('should invite a user', async ({ page }) => {
      await page.goto('/users');

      // Click Invite User button
      await page.click('button:has-text("Invite User")');

      // Fill in the form
      await page.fill('input[id="name"]', 'Invited User');
      await page.fill('input[id="email"]', `invited-${Date.now()}@example.com`);

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for success dialog
      await expect(page.locator('text=Invitation Sent Successfully')).toBeVisible({
        timeout: 5000,
      });
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
      await expect(page.locator('text=User status updated')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Field Configuration', () => {
    test('should display fields page', async ({ page }) => {
      await page.goto('/fields');
      await expect(page.locator('h1')).toContainText('Field Configuration');
      await expect(page.locator('text=Project Types')).toBeVisible();
    });

    test('should add a new field value', async ({ page }) => {
      await page.goto('/fields');

      // Find Project Types card and click Add button
      const projectTypesCard = page.locator('text=Project Types').locator('..');
      await projectTypesCard.locator('button:has-text("Add")').click();

      // Type new value
      await page.keyboard.type(`Test Type ${Date.now()}`);

      // Press Enter to save
      await page.keyboard.press('Enter');

      // Wait for success message
      await expect(page.locator('text=Field added successfully')).toBeVisible({ timeout: 5000 });
    });

    test('should edit a field value', async ({ page }) => {
      await page.goto('/fields');

      // Find first field in Project Types and click edit
      const projectTypesCard = page.locator('text=Project Types').locator('..');
      await projectTypesCard.locator('button[aria-label="Edit"]').first().click();

      // Clear and type new value
      await page.keyboard.press('Control+A');
      await page.keyboard.type('Updated Type');

      // Click check to save
      await projectTypesCard.locator('button:has-text("✓")').click();

      // Wait for success message
      await expect(page.locator('text=Field updated successfully')).toBeVisible({ timeout: 5000 });
    });

    test('should delete a field value', async ({ page }) => {
      await page.goto('/fields');

      // Add a field first
      const projectTypesCard = page.locator('text=Project Types').locator('..');
      await projectTypesCard.locator('button:has-text("Add")').click();
      const testValue = `Delete Test ${Date.now()}`;
      await page.keyboard.type(testValue);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Find and delete the field
      const fieldRow = page.locator(`text=${testValue}`).locator('..');
      await fieldRow.locator('button[aria-label="Delete"]').click();

      // Confirm deletion
      await page.click('button:has-text("Delete")');

      // Wait for success message
      await expect(page.locator('text=Field deleted successfully')).toBeVisible({ timeout: 5000 });
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
      await page.click('button:has-text("All Actions")');

      // Select a specific action
      await page.click('text=USER_CREATED');

      // Verify table is filtered
      await expect(page.locator('table tbody tr')).toHaveCount(1);
    });

    test('should search audit logs', async ({ page }) => {
      await page.goto('/audit-logs');

      // Type in search box
      await page.fill('input[placeholder="Search logs..."]', 'admin');

      // Verify filtered results
      const rows = page.locator('table tbody tr');
      await expect(rows.first()).toBeVisible();
    });

    test('should view audit log details', async ({ page }) => {
      await page.goto('/audit-logs');

      // Click on first log entry's details button
      await page.locator('table tbody tr').first().locator('button').last().click();

      // Verify dialog is open
      await expect(page.locator('text=Audit Log Details')).toBeVisible();
      await expect(page.locator('text=Action')).toBeVisible();
      await expect(page.locator('text=Entity Type')).toBeVisible();
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
      // Logout
      await page.click('button:has-text("Logout")');

      // Login as editor using demo button
      await page.goto('/login');
      await page.getByRole('button', { name: 'Editor' }).click();
      await expect(page).toHaveURL('/');

      // Verify admin menu items are not visible
      await expect(page.locator('nav >> text=Users')).not.toBeVisible();
      await expect(page.locator('nav >> text=Fields')).not.toBeVisible();
      await expect(page.locator('nav >> text=Audit Logs')).not.toBeVisible();

      // Try to access users page directly
      await page.goto('/users');

      // Should be redirected or see unauthorized
      await expect(page).not.toHaveURL('/users');
    });
  });
});
