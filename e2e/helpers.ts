import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  ACCOUNT_EMAILS as ACCOUNTS,
  FIXTURE_PASSWORD,
} from '../tests/fixtures/constants';

export { ACCOUNTS };

export type RoleKey = keyof typeof ACCOUNTS;

export const PASSWORD = FIXTURE_PASSWORD;

export function authFile(role: RoleKey): string {
  return path.join(process.cwd(), '.auth', `${role}.json`);
}

/**
 * Restores the deterministic fixture set before a spec file runs.
 *
 * Each file owns its data: a status change or a read alert in one spec cannot
 * make another spec order-dependent, and running a single spec directly still
 * starts from a known state. The seed refuses any database that is not a
 * disposable *_test database.
 */
export function resetFixtures(): void {
  // test-env.ts swaps DATABASE_URL for TEST_DATABASE_URL and refuses when
  // they are identical, so DATABASE_URL is deliberately left as loaded from
  // .env and the child process performs the swap itself.
  const envFile = path.join(process.cwd(), '.env');

  if (fs.existsSync(envFile)) {
    for (const rawLine of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const match = rawLine.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  }

  const testUrl = process.env.TEST_DATABASE_URL;

  if (!testUrl) {
    throw new Error('TEST_DATABASE_URL is required to reset fixtures.');
  }

  const result = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      '--import',
      './tests/setup/test-env.ts',
      'tests/fixtures/seed-test-db.ts',
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, TEST_DATABASE_URL: testUrl },
      encoding: 'utf8',
      shell: false,
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `fixture reset failed (exit ${result.status})\n${result.stdout ?? ''}\n${result.stderr ?? ''}`,
    );
  }
}
