/**
 * Provisions the isolated test database.
 *
 *   node scripts/test-db-setup.mjs [--reset]
 *
 * Safety contract:
 *   - only a loopback PostgreSQL host is accepted;
 *   - the database name must end in `_test`;
 *   - the development DATABASE_URL is never used for CREATE/DROP;
 *   - `--reset` drops and recreates only the guarded test database.
 *
 * The connection used for administration is TEST_DATABASE_URL itself; the
 * server-level `postgres` database is used purely to create/drop the test
 * database, never to modify application data.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RESET = process.argv.includes('--reset');

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;

  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = rawLine.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, '');
  }
}

loadEnvFile(path.join(ROOT, '.env'));
loadEnvFile(path.join(ROOT, '.env.local'));

const testUrl = process.env.TEST_DATABASE_URL;

if (!testUrl) {
  console.error(
    '[test-db] TEST_DATABASE_URL is not configured. Add it to .env, e.g.\n' +
      '  TEST_DATABASE_URL=postgresql://medorch:medorch_dev_password@localhost:5432/medorch_test',
  );
  process.exit(1);
}

const parsed = new URL(testUrl);
const databaseName = parsed.pathname.replace(/^\//, '');
const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

if (!loopbackHosts.has(parsed.hostname)) {
  console.error(
    `[test-db] refusing to run: host "${parsed.hostname}" is not loopback.`,
  );
  process.exit(1);
}

if (!/^[a-z0-9_]+_test$/.test(databaseName)) {
  console.error(
    `[test-db] refusing to run: "${databaseName}" does not end in "_test".`,
  );
  process.exit(1);
}

if (process.env.DATABASE_URL === testUrl) {
  console.error(
    '[test-db] refusing to run: TEST_DATABASE_URL must differ from DATABASE_URL.',
  );
  process.exit(1);
}

/** Connect to the server-level maintenance database for CREATE/DROP. */
function adminUrlFor(url, dbName) {
  const next = new URL(url);
  next.pathname = `/${dbName}`;
  return next.toString();
}

async function ensureDatabase() {
  const admin = new Client({ connectionString: adminUrlFor(testUrl, 'postgres') });
  await admin.connect();

  try {
    if (RESET) {
      await admin.query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`);
      console.log(`[test-db] dropped "${databaseName}"`);
    }

    const existing = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    );

    if (existing.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`[test-db] created "${databaseName}"`);
    } else {
      console.log(`[test-db] reusing "${databaseName}"`);
    }
  } finally {
    await admin.end();
  }
}

function migrate() {
  // Run Prisma through Node directly: the .cmd shim is not spawnable with
  // shell:false on Windows, and a shell adds quoting risk with credentials.
  const prismaCli = path.join(ROOT, 'node_modules', 'prisma', 'build', 'index.js');

  if (!fs.existsSync(prismaCli)) {
    throw new Error('Prisma CLI is not installed; run npm install first.');
  }

  const result = spawnSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: testUrl },
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`prisma migrate deploy exited ${result.status}`);
  }
}

await ensureDatabase();
migrate();
console.log('[test-db] schema is up to date');
