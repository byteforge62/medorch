/**
 * Visual-upgrade verification harness.
 *
 * Drives the locally installed Chrome in headless mode over the DevTools
 * Protocol. No dependency is installed: Node 22 ships a global WebSocket,
 * and the browser is the one already on the machine.
 *
 * What it produces
 * ----------------
 *   docs/design-system/final-visual-upgrade/screenshots/<role>-<route>-<w>.png
 *     Exact viewport captures at 1440x900, 1024x768 and 390x844.
 *   docs/design-system/final-visual-upgrade/evidence/browser-audit.json
 *     Per-page width, overflow, image count, broken images, missing alt
 *     text, console errors and the rendered h1.
 *
 * The harness signs in with the seeded demo accounts through the real
 * NextAuth credentials callback. It changes no application data.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'docs/design-system/final-visual-upgrade');
const SHOTS = path.join(OUT, 'screenshots');
const EVIDENCE = path.join(OUT, 'evidence');
const PROFILE = path.join(ROOT, '.tmp-visual-upgrade-profile');
const PORT = 9231;
const BASE = process.env.APP_BASE_URL || 'http://localhost:3000';
const ONLY_ROLE = process.env.ONLY_ROLE;
const ONLY_ROUTE = process.env.ONLY_ROUTE;

const CHROME =
  process.env.CHROME_PATH ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';

const VIEWPORTS = [
  { width: 1440, height: 900, mobile: false },
  { width: 1024, height: 768, mobile: false },
  { width: 390, height: 844, mobile: true },
];

const ROLES = {
  admin: {
    email: 'admin@medorch.local',
    password: 'MedOrch@Dev123!',
    routes: [
      ['dashboard', '/dashboard'],
      ['schedules', '/schedules'],
      ['departments', '/departments'],
      ['patients', '/patients'],
      ['doctors', '/doctors'],
      ['equipment', '/equipment'],
      ['theatres', '/ot-rooms'],
      ['alerts', '/alerts'],
      ['audit', '/audit'],
    ],
  },
  doctor: {
    email: 'ananya.shah@demo.medorch.local',
    password: 'MedOrch@Demo123!',
    routes: [
      ['dashboard', '/dashboard'],
      ['schedules', '/schedules'],
      ['doctors', '/doctors'],
    ],
  },
  otstaff: {
    email: 'kavya.nurse@demo.medorch.local',
    password: 'MedOrch@Demo123!',
    routes: [
      ['dashboard', '/dashboard'],
      ['theatres', '/ot-rooms'],
    ],
  },
  patient: {
    email: 'aarav.mehta@demo.medorch.local',
    password: 'MedOrch@Demo123!',
    routes: [
      ['dashboard', '/dashboard'],
      ['appointments', '/patients/appointments'],
    ],
  },
};

const PUBLIC_ROUTES = [
  ['landing', '/'],
  ['login', '/login'],
];

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Set();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      for (const listener of this.listeners) listener(message);
    });
    return this;
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }

  onMessage(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  close() {
    this.ws.close();
  }
}

async function waitForJson(url, attempts = 80) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      /* not ready yet */
    }
    await delay(250);
  }
  throw new Error(`Endpoint did not become ready: ${url}`);
}

async function evaluate(cdp, sessionId, expression, awaitPromise = false) {
  const result = await cdp.send(
    'Runtime.evaluate',
    { expression, awaitPromise, returnByValue: true },
    sessionId,
  );
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Evaluation failed');
  }
  return result.result?.value;
}

async function navigate(cdp, sessionId, url) {
  await cdp.send('Page.navigate', { url }, sessionId);
  await delay(450);

  for (let i = 0; i < 60; i += 1) {
    const state = await evaluate(cdp, sessionId, 'document.readyState');
    if (state === 'complete') break;
    await delay(120);
  }

  // Wait for client data to replace skeletons before capturing.
  for (let i = 0; i < 48; i += 1) {
    const ready = await evaluate(
      cdp,
      sessionId,
      `({
        heading: Boolean(document.querySelector('h1')),
        skeletons: document.querySelectorAll('.skeleton, [aria-busy="true"]').length,
      })`,
    );
    if (ready?.heading && ready.skeletons === 0) break;
    await delay(250);
  }

  // Settle fonts, lazy images and any reveal animation, then return to the top.
  await evaluate(
    cdp,
    sessionId,
    `(async () => {
      await document.fonts?.ready;
      const height = Math.min(document.body.scrollHeight, 5000);
      window.scrollTo({ top: height, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 450));
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 250));
      return true;
    })()`,
    true,
  );
  // The plate reveal runs for 1.1s; capture only after it has settled.
  await delay(1250);
}

async function login(cdp, sessionId, { email, password }) {
  const jar = new Map();
  const absorb = (response) => {
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const index = pair.indexOf('=');
      jar.set(pair.slice(0, index), pair.slice(index + 1));
    }
  };
  const cookieHeader = () => [...jar].map(([key, value]) => `${key}=${value}`).join('; ');

  const csrfResponse = await fetch(`${BASE}/api/auth/csrf`);
  absorb(csrfResponse);
  const { csrfToken } = await csrfResponse.json();

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${BASE}/dashboard`,
    json: 'true',
  });
  let session = null;

  // The first sign-in after a dev-server recompile can lose its transaction
  // while Next.js is still warming route workers. Retry before failing.
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const callback = await fetch(`${BASE}/api/auth/callback/credentials`, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookieHeader(),
      },
      body,
    });
    absorb(callback);

    const sessionResponse = await fetch(`${BASE}/api/auth/session`, {
      headers: { Cookie: cookieHeader() },
    });
    session = await sessionResponse.json();

    if (session?.user?.role) break;
    await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
  }

  if (!session?.user?.role) {
    throw new Error(`Sign-in failed for ${email}: ${JSON.stringify(session)}`);
  }

  const sessionEntry = [...jar].find(([key]) => key.includes('session-token'));
  if (!sessionEntry) throw new Error('Sign-in returned no session cookie');

  await cdp.send('Network.enable', {}, sessionId);
  await cdp.send(
    'Network.setCookie',
    {
      name: sessionEntry[0],
      value: sessionEntry[1],
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
    sessionId,
  );

  return {
    email: session.user.email,
    role: session.user.role,
    cookieName: sessionEntry[0],
  };
}

const AUDIT_EXPRESSION = `(() => {
  const images = Array.from(document.images);
  const broken = images
    .filter((image) => image.complete && image.naturalWidth === 0)
    .map((image) => image.currentSrc || image.src);
  const missingAlt = images
    .filter((image) => !image.hasAttribute('alt') && image.getAttribute('aria-hidden') !== 'true')
    .length;
  return {
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    viewportWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    imageCount: images.length,
    brokenImages: broken,
    missingAlt,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})()`;

async function capture(cdp, sessionId, file) {
  const result = await cdp.send(
    'Page.captureScreenshot',
    { format: 'png', fromSurface: true, captureBeyondViewport: false },
    sessionId,
  );
  fs.writeFileSync(file, Buffer.from(result.data, 'base64'));
}

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
  fs.mkdirSync(EVIDENCE, { recursive: true });
  fs.rmSync(PROFILE, { recursive: true, force: true });

  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      ...(process.env.REDUCED_MOTION ? ['--force-prefers-reduced-motion'] : []),
      `--user-data-dir=${PROFILE}`,
      `--remote-debugging-port=${PORT}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let cdp;
  try {
    const version = await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
    cdp = await new CDP(version.webSocketDebuggerUrl).open();

    const { targetId } = await cdp.send('Target.createTarget', {
      url: 'about:blank',
    });
    const { sessionId } = await cdp.send('Target.attachToTarget', {
      targetId,
      flatten: true,
    });

    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Log.enable', {}, sessionId);

    let consoleErrors = [];
    cdp.onMessage((message) => {
      if (message.sessionId !== sessionId) return;
      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        consoleErrors.push(
          message.params.args
            .map((arg) => arg.value ?? arg.description ?? '')
            .join(' ')
            .slice(0, 5000),
        );
      }
      if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
        consoleErrors.push(message.params.entry.text.slice(0, 5000));
      }
    });

    if (process.env.REDUCED_MOTION) {
      await cdp.send(
        'Emulation.setDeviceMetricsOverride',
        { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
        sessionId,
      );
      await navigate(cdp, sessionId, `${BASE}/`);
      await evaluate(
        cdp,
        sessionId,
        `(async () => {
          const height = document.body.scrollHeight;
          for (let y = 0; y < height; y += 600) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 80));
          }
          return true;
        })()`,
        true,
      );
      await delay(500);
      const reduced = await evaluate(
        cdp,
        sessionId,
        `(() => {
          const plates = Array.from(document.querySelectorAll('.photo-reveal img'));
          const skeletons = Array.from(document.querySelectorAll('.skeleton'));
          return {
            mediaMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            plateCount: plates.length,
            plateAnimationNames: plates.map((node) => getComputedStyle(node).animationName),
            plateAnimationDurations: plates.map((node) => getComputedStyle(node).animationDuration),
            skeletonCount: skeletons.length,
            skeletonAnimationNames: skeletons.map((node) => getComputedStyle(node).animationName),
          };
        })()`,
      );
      fs.writeFileSync(
        path.join(EVIDENCE, 'reduced-motion.json'),
        JSON.stringify(
          {
            capturedAt: new Date().toISOString(),
            emulation: 'Chrome --force-prefers-reduced-motion, 1440x900',
            route: '/',
            ...reduced,
            pass:
              reduced.mediaMatches === true &&
              reduced.plateAnimationNames.every((name) => name === 'none') &&
              reduced.skeletonAnimationNames.every((name) => name === 'none'),
          },
          null,
          2,
        ),
      );
      console.log('Reduced-motion check:', reduced);
      return;
    }

    const audit = [];

    async function visit(role, label, route, viewport) {
      await cdp.send(
        'Emulation.setDeviceMetricsOverride',
        {
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1,
          mobile: viewport.mobile,
        },
        sessionId,
      );

      consoleErrors = [];
      await navigate(cdp, sessionId, `${BASE}${route}`);
      const checks = await evaluate(cdp, sessionId, AUDIT_EXPRESSION);

      const file = path.join(SHOTS, `${role}-${label}-${viewport.width}.png`);
      await capture(cdp, sessionId, file);

      if (process.env.FULL_PAGE && viewport.width === 1440) {
        const metrics = await cdp.send('Page.getLayoutMetrics', {}, sessionId);
        await cdp.send(
          'Emulation.setDeviceMetricsOverride',
          {
            width: viewport.width,
            height: Math.ceil(metrics.cssContentSize.height),
            deviceScaleFactor: 1,
            mobile: false,
          },
          sessionId,
        );
        await delay(500);
        await capture(cdp, sessionId, file.replace('.png', '-full.png'));
        await cdp.send(
          'Emulation.setDeviceMetricsOverride',
          {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            mobile: false,
          },
          sessionId,
        );
      }

      audit.push({
        role,
        route,
        viewport: `${viewport.width}x${viewport.height}`,
        screenshot: path.relative(OUT, file),
        ...checks,
        consoleErrors: [...new Set(consoleErrors)],
      });
      console.log(
        `${role.padEnd(8)} ${label.padEnd(14)} ${viewport.width}x${viewport.height}  images=${checks.imageCount} broken=${checks.brokenImages.length} overflow=${checks.overflow}`,
      );
    }

    // Public surfaces first (signed out).
    if (!ONLY_ROLE) {
      for (const viewport of VIEWPORTS) {
        await cdp.send(
          'Emulation.setDeviceMetricsOverride',
          {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            mobile: viewport.mobile,
          },
          sessionId,
        );
        for (const [label, route] of PUBLIC_ROUTES) {
          await visit('public', label, route, viewport);
        }
      }
    }

    for (const [role, config] of Object.entries(process.env.ONLY_PUBLIC ? {} : ROLES)) {
      if (ONLY_ROLE && role !== ONLY_ROLE) continue;

      const session = await login(cdp, sessionId, config);
      console.log(`Signed in ${role}: ${session.email} (${session.role})`);

      const routes = config.routes.filter(([label]) => !ONLY_ROUTE || label === ONLY_ROUTE);

      for (const viewport of VIEWPORTS) {
        for (const [label, route] of routes) {
          await visit(role, label, route, viewport);
        }
      }
    }

    fs.writeFileSync(
      path.join(EVIDENCE, 'browser-audit.json'),
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl: BASE,
          viewports: VIEWPORTS.map((item) => `${item.width}x${item.height}`),
          pages: audit,
          summary: {
            pages: audit.length,
            brokenImages: audit.reduce((sum, page) => sum + page.brokenImages.length, 0),
            overflowPages: audit.filter((page) => page.overflow).length,
            missingAlt: audit.reduce((sum, page) => sum + page.missingAlt, 0),
            consoleErrorPages: audit.filter((page) => page.consoleErrors.length > 0).length,
          },
        },
        null,
        2,
      ),
    );

    console.log('Audit written:', path.join(EVIDENCE, 'browser-audit.json'));
  } finally {
    cdp?.close();
    chrome.kill();
    await delay(600);
    try {
      fs.rmSync(PROFILE, { recursive: true, force: true });
    } catch {
      /* profile cleanup is best effort */
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
