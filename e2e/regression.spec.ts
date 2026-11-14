import { expect, test, type Page } from '@playwright/test';

import { authFile, resetFixtures, type RoleKey } from './helpers';

/**
 * Browser-level regression guards for the four dashboards: no runtime errors
 * reach the console, no same-origin asset fails to load, and the shell never
 * overflows horizontally at the supported desktop and mobile widths.
 */

test.beforeAll(() => {
  resetFixtures();
});

type Diagnostics = {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
};

function collect(page: Page): Diagnostics {
  const diagnostics: Diagnostics = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
  };

  page.on('console', (message) => {
    if (message.type() === 'error') {
      diagnostics.consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    diagnostics.pageErrors.push(error.message);
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    // External or intentionally aborted navigations are out of scope; broken
    // same-origin assets and API calls are not.
    if (url.startsWith('http://127.0.0.1:') || url.startsWith('/')) {
      diagnostics.failedRequests.push(`${request.method()} ${url}`);
    }
  });

  return diagnostics;
}

async function expectHealthyDashboard(page: Page, diagnostics: Diagnostics) {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            Array.from(document.images).filter(
              (image) => image.complete && image.naturalWidth === 0,
            ).length,
        ),
      { message: 'dashboard images should all have decoded' },
    )
    .toBe(0);

  await page.waitForLoadState('networkidle');

  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.consoleErrors).toEqual([]);
  expect(diagnostics.failedRequests).toEqual([]);
}

const DASHBOARD_ROLES: RoleKey[] = ['admin', 'doctor', 'ot', 'patientOne'];

for (const role of DASHBOARD_ROLES) {
  test.describe(`${role} dashboard regression`, () => {
    test.use({ storageState: authFile(role) });

    test('renders without runtime errors, broken assets or horizontal overflow', async ({
      page,
    }) => {
      const diagnostics = collect(page);

      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/dashboard');
      await expectHealthyDashboard(page, diagnostics);

      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(
          overflow,
          `dashboard overflows horizontally at ${width}px`,
        ).toBeLessThanOrEqual(1);
      }

      expect(diagnostics.pageErrors).toEqual([]);
      expect(diagnostics.consoleErrors).toEqual([]);
    });
  });
}
