import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SessionProvider } from 'next-auth/react';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';

import { Sidebar } from '@/components/layout/Sidebar';
import { UserRole } from '@/generated/prisma/enums';

/**
 * Role navigation coverage.
 *
 * The sidebar is the only place a role learns which modules exist, so a
 * regression here silently exposes or hides a whole module. These assertions
 * read the rendered anchors, not the nav configuration, so a component-level
 * filtering bug cannot pass.
 */
function renderSidebar(role: UserRole): string {
  const session = {
    user: { name: 'QA Tester', email: 'qa@example.test', role },
    expires: '2999-01-01T00:00:00.000Z',
  } as never;

  return renderToStaticMarkup(
    <SessionProvider session={session}>
      <PathnameContext.Provider value="/dashboard">
        <Sidebar isOpen onClose={() => undefined} role={role} />
      </PathnameContext.Provider>
    </SessionProvider>,
  );
}

function hrefs(html: string): string[] {
  return [...html.matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1]);
}

const EXPECTED: Record<UserRole, { allowed: string[]; forbidden: string[] }> = {
  [UserRole.ADMIN]: {
    allowed: [
      '/dashboard',
      '/schedules',
      '/ot-rooms',
      '/departments',
      '/patients',
      '/doctors',
      '/equipment',
      '/users',
      '/audit',
    ],
    forbidden: ['/patients/appointments'],
  },
  [UserRole.DOCTOR]: {
    allowed: [
      '/dashboard',
      '/schedules',
      '/ot-rooms',
      '/departments',
      '/patients',
      '/doctors',
      '/equipment',
    ],
    forbidden: ['/users', '/audit', '/patients/appointments'],
  },
  [UserRole.OT_STAFF]: {
    allowed: [
      '/dashboard',
      '/schedules',
      '/ot-rooms',
      '/departments',
      '/doctors',
      '/equipment',
    ],
    forbidden: ['/users', '/audit', '/patients', '/patients/appointments'],
  },
  [UserRole.PATIENT]: {
    allowed: ['/dashboard', '/patients/appointments'],
    forbidden: [
      '/users',
      '/audit',
      '/patients',
      '/schedules',
      '/ot-rooms',
      '/departments',
      '/doctors',
      '/equipment',
    ],
  },
};

for (const role of Object.values(UserRole)) {
  test(`sidebar shows only ${role} destinations`, () => {
    const rendered = hrefs(renderSidebar(role));
    const { allowed, forbidden } = EXPECTED[role];

    for (const href of allowed) {
      assert.ok(rendered.includes(href), `${role} should see ${href}`);
    }

    for (const href of forbidden) {
      assert.equal(
        rendered.includes(href),
        false,
        `${role} must not see ${href}`,
      );
    }
  });
}

test('every role can reach its dashboard from the sidebar', () => {
  for (const role of Object.values(UserRole)) {
    assert.ok(
      hrefs(renderSidebar(role)).includes('/dashboard'),
      `${role} must be able to navigate back to /dashboard`,
    );
  }
});

test('the sidebar marks the active destination for assistive technology', () => {
  const html = renderSidebar(UserRole.ADMIN);
  assert.match(html, /aria-current="page"/);
});
