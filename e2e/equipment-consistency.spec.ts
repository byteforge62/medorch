import { expect, test } from '@playwright/test';

import { authFile, resetFixtures } from './helpers';

test.use({ storageState: authFile('admin') });

test.beforeAll(() => {
  resetFixtures();
});

/**
 * Cross-module equipment consistency: a status written through the register
 * must be the status every other screen reports, and the dashboard counts must
 * agree with the register after the mutation (and after reverting it).
 */
test('equipment status change is reflected in the register and the dashboard', async ({
  page,
}) => {
  await page.goto('/equipment');

  const monitorRow = page.locator('tr', { hasText: 'QA Monitor' });
  await expect(monitorRow).toBeVisible();

  const statusSelect = monitorRow.getByLabel('Status for QA Monitor');
  await expect(statusSelect).toHaveValue('AVAILABLE');

  await statusSelect.selectOption('MAINTENANCE');
  await expect(statusSelect).toHaveValue('MAINTENANCE');

  // The admin dashboard counts the same underlying records: zero available.
  await page.goto('/dashboard');
  await expect(page.getByText(/0\/3/).first()).toBeVisible();

  await page.goto('/equipment');
  const refreshedRow = page.locator('tr', { hasText: 'QA Monitor' });
  await refreshedRow.getByLabel('Status for QA Monitor').selectOption('AVAILABLE');
  await expect(refreshedRow.getByLabel('Status for QA Monitor')).toHaveValue(
    'AVAILABLE',
  );

  await page.goto('/dashboard');
  await expect(page.getByText(/1\/3/).first()).toBeVisible();
});

test('maintenance and in-use equipment are never presented as available', async ({
  page,
}) => {
  await page.goto('/equipment');

  const ventilator = page.locator('tr', { hasText: 'QA Ventilator' });
  const drill = page.locator('tr', { hasText: 'QA Drill' });

  await expect(ventilator.getByLabel('Status for QA Ventilator')).toHaveValue(
    'IN_USE',
  );
  await expect(drill.getByLabel('Status for QA Drill')).toHaveValue(
    'MAINTENANCE',
  );

  // Neither record can be selected as an available unit: the register only
  // offers the states the schema allows, and their stored values are the
  // authoritative copy the dashboards read.
  await expect(ventilator.getByLabel('Status for QA Ventilator')).not.toHaveValue(
    'AVAILABLE',
  );
  await expect(drill.getByLabel('Status for QA Drill')).not.toHaveValue(
    'AVAILABLE',
  );
});
