import { expect, test } from '@playwright/test';

import { authFile, resetFixtures } from './helpers';

test.describe('patient notifications', () => {
  test.use({ storageState: authFile('patientOne') });

  test.beforeAll(() => {
    resetFixtures();
  });

  test('marking an alert as read persists and clears the unread count', async ({
    page,
    request,
  }) => {
    await page.goto('/dashboard');

    const notifications = page.getByRole('region', { name: 'Notifications' });
    await expect(notifications).toContainText('1 unread');

    await notifications.getByRole('button', { name: 'Mark as read' }).click();
    await expect(notifications).toContainText('Up to date');

    // Persisted server-side, not only in local component state.
    const response = await request.get('/api/alerts');
    const body = (await response.json()) as {
      data: Array<{ id: string; isRead: boolean }>;
    };
    const alert = body.data.find(
      (item) => item.id === 'd1111111-1111-4111-8111-111111111111',
    );

    expect(alert?.isRead).toBe(true);

    await page.reload();
    await expect(
      page.getByRole('region', { name: 'Notifications' }),
    ).toContainText('Up to date');
  });
});

test.describe('second patient isolation', () => {
  test.use({ storageState: authFile('patientTwo') });

  test('sees only their own alert and their own appointments', async ({
    page,
    request,
  }) => {
    await page.goto('/dashboard');

    const notifications = page.getByRole('region', { name: 'Notifications' });
    await expect(notifications).toContainText('QA other patient alert');
    await expect(notifications).not.toContainText('QA theatre time changed');
    await expect(page.getByText('QA-P-002')).toBeVisible();

    const portal = await request.get('/api/me/appointments');
    const body = (await portal.json()) as {
      data: { patientCode: string; schedules: Array<{ procedure: string }> };
    };

    expect(body.data.patientCode).toBe('QA-P-002');
    expect(body.data.schedules.map((item) => item.procedure)).not.toContain(
      'QA Cholecystectomy',
    );
  });
});
