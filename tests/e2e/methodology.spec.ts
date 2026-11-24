import { expect, test } from '@playwright/test';

test.describe('Methodology Page', () => {
  test('is reachable from the header and shows both sections', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('app-header').getByRole('button', { name: 'Methodology' }).click();

    await expect(page).toHaveURL(/\/methodology$/);
    await expect(page.getByRole('heading', { name: 'Methodology', level: 1 })).toBeVisible();
    await expect(page.getByTestId('methodology-section')).toHaveCount(2);
  });

  test('links Energy to Evolve without showing the URL', async ({ page }) => {
    await page.goto('/methodology');

    const link = page.getByRole('link', { name: /Energy to Evolve/i });
    await expect(link).toHaveAttribute('href', 'https://youtu.be/w_60Qb-4KHo');
    await expect(page.getByText('youtu.be')).toHaveCount(0);
  });
});
