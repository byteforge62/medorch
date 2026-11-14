import fs from 'node:fs';
import path from 'node:path';

import { expect, test as setup } from '@playwright/test';

import { ACCOUNTS, PASSWORD, authFile, type RoleKey } from './helpers';

/**
 * Authenticates every fixture account against the real NextAuth credentials
 * endpoint and stores the resulting cookie jar. Specs then start from a signed
 * in browser without repeating the login UI for each test.
 */
for (const role of Object.keys(ACCOUNTS) as RoleKey[]) {
  setup(`authenticate ${role}`, async ({ request }) => {
    const csrfResponse = await request.get('/api/auth/csrf');
    expect(csrfResponse.ok()).toBeTruthy();

    const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
    expect(csrfToken).toBeTruthy();

    const signIn = await request.post('/api/auth/callback/credentials', {
      form: {
        csrfToken,
        email: ACCOUNTS[role],
        password: PASSWORD,
        callbackUrl: '/dashboard',
        json: 'true',
      },
    });

    expect(signIn.status(), `credentials sign-in for ${role}`).toBeLessThan(400);

    const session = await request.get('/api/auth/session');
    const sessionBody = (await session.json()) as {
      user?: { email?: string; role?: string };
    };

    expect(sessionBody.user?.email).toBe(ACCOUNTS[role]);

    fs.mkdirSync(path.dirname(authFile(role)), { recursive: true });
    await request.storageState({ path: authFile(role) });
  });
}
