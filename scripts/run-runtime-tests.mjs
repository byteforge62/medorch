/**
 * Runtime authorization harness for MedOrch.
 *
 * Repairs the three historical blockers of `npm run test:runtime` without
 * adding dependencies or changing the test file's intent:
 *   1. no Vitest dependency — the suite now runs on Node's built-in test
 *      runner like every other suite in tests/;
 *   2. no server — this script builds-checks, starts `next start` on a free
 *      loopback port and exports RUNTIME_APP_PORT / RUNTIME_SERVER_PID;
 *   3. no safe database — it creates a disposable `medorch_runtime_test_*`
 *      database inside the existing local Postgres container, applies
 *      committed migrations and the deterministic seed (with the
 *      development-only SEED_VERIFIED_PATIENTS flag), and drops it again.
 *
 * Safety rules enforced here:
 *   - the configured DATABASE_URL host must be loopback;
 *   - the database name must start with `medorch_runtime_test_` before any
 *     CREATE/DROP runs;
 *   - the ordinary development database is never targeted;
 *   - teardown runs even when tests fail (try/finally), and Ctrl-C drops the
 *     database and stops the server.
 *
 * Usage: node scripts/run-runtime-tests.mjs [--keep]
 *   --keep  leave the disposable database and server running for debugging.
 */
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEEP = process.argv.includes('--keep');
const CONTAINER = 'medorch-postgres';
const PSQl = ['exec', CONTAINER, 'psql', '-U', 'medorch', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'];

function fail(message) {
  console.error(`\n[harness] ERROR: ${message}`);
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    env: { ...process.env, ...(options.env ?? {}) },
    shell: false,
  });
  if (result.error) throw new Error(`${command} failed to start: ${result.error.message}`);
  if (result.status !== 0 && !options.allowFailure) {
    const out = options.capture ? `${result.stdout ?? ''}\n${result.stderr ?? ''}` : '';
    throw new Error(`${command} ${args.join(' ')} exited ${result.status}\n${out}`);
  }
  return result;
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitForHttp(url, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return;
    } catch {
      /* not ready yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`server did not become ready at ${url} within ${timeoutMs}ms`);
}

// ---------------------------------------------------------------------------
// Preconditions
// ---------------------------------------------------------------------------
process.chdir(ROOT);

const dotenvLines = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
if (!dotenvLines) fail('.env is missing — cannot derive the local database connection.');

// Load .env then .env.local the same way Next/Prisma do (without overriding
// the values we inject later), so DATABASE_URL/AUTH_SECRET are available.
for (const [file, override] of [['.env', false], ['.env.local', false]]) {
  if (!fs.existsSync(file)) continue;
  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = rawLine.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined && !override) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, '');
  }
}

const devDatabaseUrl = process.env.DATABASE_URL;
if (!devDatabaseUrl) fail('DATABASE_URL is not configured.');
const parsedDevUrl = new URL(devDatabaseUrl);
const host = parsedDevUrl.hostname;
if (host !== '127.0.0.1' && host !== 'localhost' && host !== '::1') {
  fail(`refusing to run: DATABASE_URL host "${host}" is not loopback.`);
}

if (!fs.existsSync(path.join(ROOT, '.next', 'BUILD_ID'))) {
  fail('no production build found — run `npm run build` first.');
}

// Container must be running (never create/delete containers here).
const containerStatus = spawnSync(
  'docker',
  ['inspect', '-f', '{{.State.Running}}', CONTAINER],
  { encoding: 'utf8' },
);
if (containerStatus.stdout?.trim() !== 'true') {
  fail(
    `container "${CONTAINER}" is not running — start Docker Desktop and \`docker compose up -d postgres\` first.`,
  );
}

// ---------------------------------------------------------------------------
// Disposable database
// ---------------------------------------------------------------------------
const dbName = `medorch_runtime_test_${randomBytes(6).toString('hex')}`;
if (!dbName.startsWith('medorch_runtime_test_')) fail('database name guard failed');

const testUrl = new URL(parsedDevUrl.toString());
testUrl.pathname = `/${dbName}`;
const testDatabaseUrl = testUrl.toString();

console.log(`[harness] disposable database: ${dbName}`);

let serverProcess = null;
let cleaned = false;
let dbCreated = false;

async function teardown() {
  if (cleaned) return;
  cleaned = true;
  if (serverProcess && serverProcess.exitCode === null) {
    console.log('[harness] stopping server...');
    serverProcess.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 1500));
    if (serverProcess.exitCode === null) serverProcess.kill('SIGKILL');
  }
  if (KEEP) {
    console.log(`[harness] --keep: leaving ${dbName} in place.`);
    return;
  }
  if (!dbCreated) return;
  console.log('[harness] dropping disposable database...');
  run('docker', [...PSQl, '-c', `DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`], {
    capture: true,
    allowFailure: true,
  });
}

process.on('SIGINT', async () => {
  await teardown();
  process.exit(130);
});

let exitCode = 1;
try {
  run('docker', [...PSQl, '-c', `CREATE DATABASE "${dbName}"`], { capture: true });
  dbCreated = true;

  // 1. migrations (committed SQL only — never migrate dev)
  console.log('[harness] applying committed migrations...');
  run(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
    env: { DATABASE_URL: testDatabaseUrl },
  });

  // 2. deterministic seed with verified patients (development-only flag),
  //    run exactly as the configured `prisma db seed` command does
  console.log('[harness] seeding demo data (SEED_VERIFIED_PATIENTS=1)...');
  run(process.execPath, ['--import', 'tsx', 'prisma/seed.ts'], {
    env: { DATABASE_URL: testDatabaseUrl, SEED_VERIFIED_PATIENTS: '1' },
  });

  // 3. production server on a free loopback port
  const port = await getFreePort();
  const origin = `http://127.0.0.1:${port}`;
  console.log(`[harness] starting next start on ${origin}...`);

  const serverEnv = {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    NEXTAUTH_URL: origin,
    AUTH_URL: origin,
    NEXT_PUBLIC_APP_URL: origin,
    PORT: String(port),
    HOSTNAME: '127.0.0.1',
  };
  serverProcess = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '-p', String(port)],
    { cwd: ROOT, env: serverEnv, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  serverProcess.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[server] ${d}`));
  serverProcess.on('exit', (code) => {
    if (!cleaned) console.error(`[harness] server exited early with code ${code}`);
  });

  await waitForHttp(`${origin}/api/auth/session`, 120_000);
  console.log('[harness] server ready.');

  // 4. run the suite against the live server
  const testRun = spawnSync(
    process.execPath,
    ['--import', 'tsx', '--test', 'tests/runtime-authorization.test.ts'],
    {
      cwd: ROOT,
      stdio: 'inherit',
      env: {
        ...serverEnv,
        RUNTIME_APP_PORT: String(port),
        RUNTIME_SERVER_PID: String(serverProcess.pid),
      },
      shell: false,
    },
  );
  if (testRun.error) throw new Error(`test runner failed to start: ${testRun.error.message}`);
  exitCode = testRun.status ?? 1;
} catch (error) {
  console.error(`[harness] ERROR: ${error.message}`);
  exitCode = 1;
} finally {
  await teardown();
}

console.log(`[harness] done (exit ${exitCode}).`);
process.exit(exitCode);
