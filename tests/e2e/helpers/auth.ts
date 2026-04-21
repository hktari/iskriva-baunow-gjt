import { expect, type Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password: string) {
  // Clear any existing session before logging in
  await page.request.post('/api/auth/signout', { failOnStatusCode: false });
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/');
}

export async function loginAsViewer(page: Page) {
  await loginAs(page, 'viewer@example.com', 'demo123');
}

export async function loginAsEditor(page: Page) {
  await loginAs(page, 'editor@example.com', 'demo123');
}

export async function loginAsSuperUser(page: Page) {
  await loginAs(page, 'admin@example.com', 'demo123');
}
