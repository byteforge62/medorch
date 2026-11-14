import { expect, test } from '@playwright/test';

import { authFile, resetFixtures } from './helpers';

test.describe('cross-module navigation', () => {
  // OT staff own the equipment panel that links cases to the register.
  test.use({ storageState: authFile('ot') });

  test.beforeAll(() => {
    resetFixtures();
  });

  test('the OT dashboard equipment panel links to the case and the register', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /Equipment register/ }).click();
    await page.waitForURL(/\/equipment$/);

    await page.goBack();
    await page.getByRole('link', { name: /^Case/ }).first().click();
    await page.waitForURL(/\/schedules\/[0-9a-f-]+/);
    await expect(
      page.getByRole('heading', { level: 2, name: 'Equipment' }),
    ).toBeVisible();
  });

  test('the schedule detail exposes the equipment register', async ({ page }) => {
    await page.goto('/schedules/c4444444-4444-4444-8444-444444444444');

    await page.getByRole('link', { name: 'Register →' }).click();
    await page.waitForURL(/\/equipment$/);
  });
});
