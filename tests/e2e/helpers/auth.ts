import { expect, type Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password: string) {
  const csrfResponse = await page.request.get('/api/auth/csrf');
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
  await page.request.post('/api/auth/callback/credentials', {
    form: {
      csrfToken,
      email,
      password,
      callbackUrl: 'http://localhost:3005/',
      json: 'true',
    },
    maxRedirects: 0,
  });
  await page.goto('/');
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
