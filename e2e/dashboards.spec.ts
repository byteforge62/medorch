import { expect, test } from '@playwright/test';

import { authFile, resetFixtures } from './helpers';

test.beforeAll(() => {
  resetFixtures();
});

test.describe('admin dashboard', () => {
  test.use({ storageState: authFile('admin') });

  test('presents live theatre, equipment and schedule information', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Good (morning|afternoon|evening), QA/,
    );

    // Theatre register states are visible with their shared labels.
    await expect(page.getByText('QA Theatre One').first()).toBeVisible();
    await expect(page.getByText('QA Theatre Two').first()).toBeVisible();
    await expect(page.getByText('Ready', { exact: true }).first()).toBeVisible();
    await expect(
      page.getByText('Maintenance', { exact: true }).first(),
    ).toBeVisible();

    // Equipment readiness reflects the three fixture items: one available.
    await expect(page.getByText(/1\/3/).first()).toBeVisible();
    await expect(page.getByText('QA Ventilator').first()).toBeVisible();

    // A fixture alert is surfaced for review.
    await expect(page.getByText('QA theatre time changed').first()).toBeVisible();
  });

  test('surfaces the in-progress and delayed cases from the schedule register', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('QA Appendectomy').first()).toBeVisible();
    await expect(page.getByText('QA Delayed Fixation').first()).toBeVisible();

    await expect(
      page.getByText('Critical', { exact: true }).first(),
    ).toBeVisible();
  });
});

test.describe('doctor dashboard', () => {
  test.use({ storageState: authFile('doctor') });

  test('shows the clinician profile and only their assigned procedures', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Day plan',
    );

    const profile = page.getByRole('region', { name: 'My clinical profile' });
    await expect(profile).toContainText('Dr. QA Surgeon');
    await expect(profile).toContainText('General Surgery');
    await expect(profile).toContainText('QA-LIC-0001');
    await expect(profile.getByRole('link', { name: /Open profile/ })).toHaveAttribute(
      'href',
      /\/doctors\//,
    );

    await expect(page.getByText('QA Cholecystectomy').first()).toBeVisible();
    await expect(page.getByText('QA Hernia Repair').first()).toBeVisible();
  });

  test('opens the assigned schedule record from the day plan', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: /Open schedule/ }).click();
    await page.waitForURL(/\/schedules\/[0-9a-f-]+/);

    // The earliest open case is the in-progress appendectomy in this theatre
    // day; the day plan sorts by start time, not by date.
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'QA Appendectomy',
    );
    await expect(page.getByText('Dr. QA Surgeon').first()).toBeVisible();
  });
});

test.describe('OT staff dashboard', () => {
  test.use({ storageState: authFile('ot') });

  test('shows the assigned theatre and the equipment allocated to its case', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Theatre command',
    );

    await expect(page.getByText('QA-OT-01').first()).toBeVisible();
    await expect(page.getByText('QA Appendectomy').first()).toBeVisible();

    const equipment = page.getByRole('region', {
      name: 'Equipment in your theatres',
    });
    await expect(equipment).toContainText('QA Ventilator');
    await expect(equipment).toContainText('In use');
    await expect(equipment).toContainText('QA-OT-01');
  });

  test('lists only assignments belonging to this staff account', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /Case/ }).first().click();
    await page.waitForURL(/\/schedules\/[0-9a-f-]+/);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'QA Appendectomy',
    );
  });
});

test.describe('patient dashboard', () => {
  test.use({ storageState: authFile('patientOne') });

  test('shows the patient record, upcoming and past appointments', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'QA Patient One',
    );

    await expect(page.getByText('QA Cholecystectomy').first()).toBeVisible();
    await expect(page.getByText('QA Hernia Repair').first()).toBeVisible();
    await expect(page.getByText('QA Completed Repair').first()).toBeVisible();
    await expect(page.getByText('Completed', { exact: true }).first()).toBeVisible();

    const record = page.getByRole('region', { name: 'Your record' });
    await expect(record).toContainText('QA-P-001');
    await expect(record).toContainText('Active');
  });

  test('shows only this patient’s notifications and their unread count', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    const notifications = page.getByRole('region', { name: 'Notifications' });
    await expect(notifications).toContainText('QA theatre time changed');
    await expect(notifications).toContainText('1 unread');
    await expect(notifications).not.toContainText('QA other patient alert');
    await expect(page.getByText('QA other patient alert')).toHaveCount(0);
  });

  test('opens the appointment detail for an owned appointment', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'View details' }).click();

    await page.waitForURL(/\/patients\/appointments\/[0-9a-f-]+/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'QA Cholecystectomy',
    );
  });

  test('cannot open another patient’s appointment', async ({ page }) => {
    await page.goto('/patients/appointments/c4444444-4444-4444-8444-444444444444');

    await expect(page.getByText('Appointment not found')).toBeVisible();
  });

  test('the appointment register keeps upcoming and past visits separate', async ({
    page,
  }) => {
    await page.goto('/patients/appointments');

    await expect(page.getByText('Upcoming').first()).toBeVisible();
    await expect(page.getByText('QA Cholecystectomy').first()).toBeVisible();
    await expect(page.getByText('Past visits').first()).toBeVisible();
    await expect(page.getByText('QA Completed Repair').first()).toBeVisible();
  });
});
