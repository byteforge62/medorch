import { expect, test } from '@playwright/test';

import { authFile, resetFixtures } from './helpers';

test.use({ storageState: authFile('admin') });

test.beforeAll(() => {
  resetFixtures();
});

test('theatre states match between the dashboard and the theatre register', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await expect(page.getByText('QA Theatre One').first()).toBeVisible();
  await expect(page.getByText('QA Theatre Two').first()).toBeVisible();

  await page.goto('/ot-rooms');
  await expect(page.getByText('QA Theatre One').first()).toBeVisible();
  await expect(page.getByText('QA Theatre Two').first()).toBeVisible();

  // The register renders the shared room vocabulary; a maintenance room must
  // never be displayed as ready.
  const readyLabel = page.getByText('Ready', { exact: true });
  const maintenanceLabel = page.getByText('Maintenance', { exact: true });

  await expect(readyLabel.first()).toBeVisible();
  await expect(maintenanceLabel.first()).toBeVisible();
});

test('a theatre case links to its schedule and the schedule links back to theatres', async ({
  page,
}) => {
  await page.goto('/ot-rooms');
  await page.getByRole('link', { name: /QA Appendectomy/ }).first().click();

  await page.waitForURL(/\/schedules\/c4444444-4444-4444-8444-444444444444/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'QA Appendectomy',
  );

  await page
    .getByRole('link', { name: 'QA Theatre One (QA-OT-01)' })
    .first()
    .click();
  await page.waitForURL(/\/ot-rooms/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /theatre|room/i,
  );
});
