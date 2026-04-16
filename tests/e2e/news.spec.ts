import { expect, test } from '@playwright/test';

test.describe('News Page', () => {
  test('should load news page and display seed articles', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/news');

    await expect(page.getByRole('heading', { name: /EU Energy News/i })).toBeVisible();

    const prismaError = consoleErrors.find(e =>
      e.includes('PrismaClient is unable to run in this browser environment')
    );
    expect(prismaError).toBeUndefined();
  });

  test('should display seeded articles from DB', async ({ page }) => {
    await page.goto('/news');

    await expect(page.getByText(/renewable energy deployment/i).first()).toBeVisible();
  });

  test('should show category filter buttons', async ({ page }) => {
    await page.goto('/news');

    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Energy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Funding' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Policy' })).toBeVisible();
  });

  test('category filter updates URL and filters articles', async ({ page }) => {
    await page.goto('/news');

    await page.getByRole('button', { name: 'Funding' }).click();

    await expect(page).toHaveURL(/category=funding/i);

    await expect(page.getByText(/CINEA/i).first()).toBeVisible();
  });

  test('search input filters articles by keyword', async ({ page }) => {
    await page.goto('/news');

    await page.getByPlaceholder('Search articles…').fill('hydrogen');

    await expect(page).toHaveURL(/search=hydrogen/i);
  });

  test('Read article links have correct attributes', async ({ page }) => {
    await page.goto('/news');

    const readLinks = page.getByRole('link', { name: /read article/i });
    await expect(readLinks.first()).toBeVisible();

    const href = await readLinks.first().getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);

    const target = await readLinks.first().getAttribute('target');
    expect(target).toBe('_blank');
  });

  test('Refresh feed button is hidden for unauthenticated users', async ({ page }) => {
    await page.goto('/news');

    await expect(page.getByRole('button', { name: /refresh feed/i })).not.toBeVisible();
  });

  test('Refresh feed button is hidden for viewer role', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Viewer' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/news');

    await expect(page.getByRole('button', { name: /refresh feed/i })).not.toBeVisible();
  });

  test('Refresh feed button is visible for super user', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Super User' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/news');

    await expect(page.getByRole('button', { name: /refresh feed/i })).toBeVisible();
  });

  test('News link is active in navigation', async ({ page }) => {
    await page.goto('/news');

    await expect(page.getByRole('link', { name: /news/i }).first()).toBeVisible();
  });
});
