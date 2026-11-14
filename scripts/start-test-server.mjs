/**
 * Starts the production server for the Playwright suite.
 *
 * 1. Requires TEST_DATABASE_URL (guarded, loopback-only, *_test name).
 * 2. Drops, recreates and migrates only that database.
 * 3. Seeds the deterministic QA fixtures.
 * 4. Runs `next start` on a loopback port with DATABASE_URL pointed at it.
 *
 * The server never reads the development database: the environment is
 * replaced before Next starts.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = String(process.env.E2E_PORT || 5301);

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
  console.error('[e2e] TEST_DATABASE_URL is required; see .env.example.');
  process.exit(1);
}

const parsed = new URL(testUrl);
const databaseName = parsed.pathname.replace(/^\//, '');

if (!new Set(['localhost', '127.0.0.1', '::1', '[::1]']).has(parsed.hostname)) {
  console.error('[e2e] refusing to run: TEST_DATABASE_URL host is not loopback.');
  process.exit(1);
}

if (!/^[a-z0-9_]+_test$/.test(databaseName)) {
  console.error('[e2e] refusing to run: test database name must end in "_test".');
  process.exit(1);
}

if (!fs.existsSync(path.join(ROOT, '.next', 'BUILD_ID'))) {
  console.error('[e2e] no production build found — run `npm run build` first.');
  process.exit(1);
}

function runNode(args) {
  // DATABASE_URL stays as the development value loaded from .env: both
  // test-db-setup and test-env.ts refuse to run when DATABASE_URL already
  // equals TEST_DATABASE_URL, which is how they prove the target is distinct.
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
    shell: false,
  });

  if (result.status !== 0) {
    console.error(`[e2e] step failed: node ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

console.log('[e2e] preparing isolated test database…');
runNode(['scripts/test-db-setup.mjs', '--reset']);
runNode([
  '--import',
  'tsx',
  '--import',
  './tests/setup/test-env.ts',
  'tests/fixtures/seed-test-db.ts',
]);

const origin = `http://127.0.0.1:${PORT}`;
const serverEnv = {
  ...process.env,
  DATABASE_URL: testUrl,
  AUTH_SECRET: process.env.AUTH_SECRET || 'e2e-only-secret-not-used-in-production',
  NEXTAUTH_SECRET: process.env.AUTH_SECRET || 'e2e-only-secret-not-used-in-production',
  NEXTAUTH_URL: origin,
  AUTH_URL: origin,
  NODE_ENV: 'production',
};

const next = spawn(
  process.execPath,
  [path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', PORT],
  { cwd: ROOT, stdio: 'inherit', env: serverEnv, shell: false },
);

function shutdown(signal) {
  if (!next.killed) next.kill(signal);
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
next.on('exit', (code) => process.exit(code ?? 0));
