import { expect, test } from '@playwright/test';

import { ACCOUNTS, PASSWORD, authFile } from './helpers';

test.describe('credentials authentication', () => {
  test('an anonymous visit to a protected route lands on the sign-in page', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);

    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sign in', exact: true }),
    ).toBeVisible();
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('invalid credentials are rejected without a session', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(ACCOUNTS.admin);
    await page.getByLabel('Password').fill('definitely-wrong-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(
      page.getByText('Invalid email or password.', { exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('a doctor signing in through the form reaches the doctor dashboard', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(ACCOUNTS.doctor);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await page.waitForURL(/\/dashboard/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Day plan',
    );
    // Session is established server-side, not just in client state.
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Day plan',
    );
  });

  test('signing out ends the session and protects the dashboard again', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill(ACCOUNTS.ot);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(/\/dashboard/);

    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL(/\/login/);

    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
  });

  test('a signed-in sidebar hides destinations the role cannot use', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: authFile('ot'),
    });
    const page = await context.newPage();

    await page.goto('/dashboard');
    const navigation = page.locator('#primary-navigation');

    await expect(navigation.getByRole('link', { name: 'Equipment' })).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Accounts' })).toHaveCount(0);
    await expect(navigation.getByRole('link', { name: 'Audit trail' })).toHaveCount(0);
    await expect(navigation.getByRole('link', { name: 'Patients' })).toHaveCount(0);

    await context.close();
  });
});
