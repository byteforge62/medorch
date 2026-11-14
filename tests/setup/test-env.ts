/**
 * Test environment loader.
 *
 * Every database-backed suite is started with:
 *
 *   node --import tsx --import ./tests/setup/test-env.ts --test ...
 *
 * so this module runs before any application module is imported. It points
 * the application at TEST_DATABASE_URL and refuses to continue unless that
 * database is unambiguously disposable. Nothing here may weaken the guard:
 * a misconfigured environment must abort the run, never fall back to the
 * development database.
 */
import 'dotenv/config';

const testUrl = process.env.TEST_DATABASE_URL;

if (!testUrl) {
  throw new Error(
    'TEST_DATABASE_URL is not configured. Create an isolated PostgreSQL ' +
      'database (for example medorch_test) and set TEST_DATABASE_URL in .env.',
  );
}

let parsed: URL;

try {
  parsed = new URL(testUrl);
} catch {
  throw new Error('TEST_DATABASE_URL is not a valid connection string.');
}

const databaseName = parsed.pathname.replace(/^\//, '');
const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

if (!loopbackHosts.has(parsed.hostname)) {
  throw new Error(
    `Refusing to run tests: TEST_DATABASE_URL host "${parsed.hostname}" is not loopback.`,
  );
}

if (!/^[a-z0-9_]+_test$/.test(databaseName)) {
  throw new Error(
    `Refusing to run tests: test database name "${databaseName}" must end in "_test".`,
  );
}

if (process.env.DATABASE_URL && process.env.DATABASE_URL === testUrl) {
  throw new Error(
    'Refusing to run tests: TEST_DATABASE_URL must differ from DATABASE_URL.',
  );
}

process.env.DATABASE_URL = testUrl;
process.env.AUTH_SECRET ??= 'test-only-secret-not-used-in-production-0000';
process.env.AUTH_TRUST_HOST ??= 'true';

export const TEST_DATABASE_URL = testUrl;
