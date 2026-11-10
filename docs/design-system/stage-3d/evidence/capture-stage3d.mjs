import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = 'http://localhost:3000';
const PORT = 9223;
const CHROME =
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(import.meta.dirname, '..');
const SHOTS = path.join(ROOT, 'screenshots');
const EVIDENCE = path.join(ROOT, 'evidence');
const PROFILE = path.join(os.tmpdir(), `medorch-stage3d-${Date.now()}`);

const ACCOUNTS = {
  admin: {
    email: 'admin@medorch.local',
    password: 'MedOrch@Dev123!',
  },
  doctor: {
    email: 'ananya.shah@demo.medorch.local',
    password: 'MedOrch@Demo123!',
  },
  ot: {
    email: 'kavya.nurse@demo.medorch.local',
    password: 'MedOrch@Demo123!',
  },
  patient: {
    email: 'aarav.mehta@demo.medorch.local',
    password: 'MedOrch@Demo123!',
  },
};

if (!existsSync(CHROME)) {
  throw new Error(`Chrome not found at ${CHROME}`);
}

await mkdir(SHOTS, { recursive: true });
await mkdir(EVIDENCE, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function waitForDebugger() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Chrome debugger did not start');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    const pending = new Map();
    let id = 0;

    socket.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          const requestId = ++id;
          socket.send(JSON.stringify({ id: requestId, method, params }));
          return new Promise((res, rej) => {
            pending.set(requestId, { res, rej });
          });
        },
        close() {
          socket.close();
        },
      });
    });

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const waiter = pending.get(message.id);
      if (!waiter) return;
      pending.delete(message.id);
      if (message.error) waiter.rej(new Error(message.error.message));
      else waiter.res(message.result);
    });

    socket.addEventListener('error', reject);
  });
}

async function main() {
  await waitForDebugger();

  const targetResponse = await fetch(
    `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent('about:blank')}`,
    { method: 'PUT' },
  );
  const target = await targetResponse.json();
  const cdp = await connect(target.webSocketDebuggerUrl);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');

  const evaluate = async (expression) => {
    const result = await cdp.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text,
      );
    }
    return result.result.value;
  };

  const waitFor = async (expression, timeout = 20_000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error(`Timed out waiting for ${expression}`);
  };

  const viewport = async (width, height, mobile = false) => {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
      screenWidth: width,
      screenHeight: height,
    });
  };

  const navigate = async (url) => {
    await cdp.send('Page.navigate', { url });
    await waitFor(
      `document.readyState === 'complete' && location.href.startsWith(${JSON.stringify(BASE)})`,
    );
    await evaluate('document.fonts.ready.then(() => true)');
    await new Promise((resolve) => setTimeout(resolve, 700));
  };

  const login = async (account) => {
    await cdp.send('Network.clearBrowserCookies');
    await navigate(`${BASE}/login`);
    await evaluate(`(() => {
      const set = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      const email = document.querySelector('input[name="email"]');
      const password = document.querySelector('input[name="password"]');
      set.call(email, ${JSON.stringify(account.email)});
      email.dispatchEvent(new Event('input', { bubbles: true }));
      set.call(password, ${JSON.stringify(account.password)});
      password.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 250));
    await evaluate(`(() => {
      const form = document.querySelector('form');
      form.requestSubmit();
      return true;
    })()`);
    await waitFor(`location.pathname === '/dashboard'`, 25_000);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const clickText = async (text) => {
    return evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find((item) =>
        (item.textContent || '').includes(${JSON.stringify(text)}),
      );
      if (!button) return false;
      button.click();
      return true;
    })()`);
  };

  const screenshot = async (name) => {
    const result = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      fromSurface: true,
    });
    const file = path.join(SHOTS, name);
    await writeFile(file, Buffer.from(result.data, 'base64'));
    return file;
  };

  const report = {
    startedAt: new Date().toISOString(),
    base: BASE,
    screenshots: [],
    checks: [],
  };

  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
  };

  const hideDevOverlay = async () => {
    await evaluate(`(() => {
      for (const node of document.querySelectorAll(
        'nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button]',
      )) {
        node.style.display = 'none';
      }
      return true;
    })()`);
  };

  try {
    await viewport(1440, 900);
    await login(ACCOUNTS.admin);
    await navigate(`${BASE}/schedules?date=2026-11-06`);
    await waitFor(`document.body.innerText.includes('Theatre day')`);
    await hideDevOverlay();

    const adminView = await evaluate(`(() => {
      const text = document.body.innerText;
      const lanes = document.querySelectorAll('[data-theatre-lane]').length;
      const blocks = document.querySelectorAll('[data-schedule-id]').length;
      const newSchedule = [...document.querySelectorAll('button')].some(
        (item) => (item.textContent || '').includes('New schedule'),
      );
      return { lanes, blocks, newSchedule, hasCoordination: text.includes('Coordination notes') };
    })()`);
    check(
      'ADMIN loads theatre lanes and positioned cases',
      adminView.lanes >= 6 && adminView.blocks === 2,
      adminView,
    );
    check(
      'ADMIN sees create action',
      adminView.newSchedule === true,
      adminView,
    );
    report.screenshots.push(await screenshot('admin-schedules-1440.png'));

    const initialDate = await evaluate(
      'document.querySelector(\'input[type="date"]\').value',
    );
    await evaluate(
      'document.querySelector(\'[aria-label="Next day"]\').click()',
    );
    await waitFor(
      `document.querySelector('input[type="date"]').value === '2026-11-07'`,
    );
    check(
      'Date navigation moves to the next theatre day',
      initialDate === '2026-11-06' &&
        (await evaluate('document.querySelector(\'input[type="date"]\').value')) ===
          '2026-11-07',
      { from: initialDate, to: '2026-11-07' },
    );
    await evaluate(
      'document.querySelector(\'[aria-label="Previous day"]\').click()',
    );
    await waitFor(
      `document.querySelector('input[type="date"]').value === '2026-11-06'`,
    );

    const theatreId = await evaluate(`(() => {
      const select = [...document.querySelectorAll('select')].find((item) =>
        item.options[0]?.textContent === 'All theatres',
      );
      const option = [...select.options].find((item) =>
        item.textContent.includes('DEMO-GEN-01'),
      );
      return option?.value ?? '';
    })()`);
    await evaluate(`(() => {
      const select = [...document.querySelectorAll('select')].find((item) =>
        item.options[0]?.textContent === 'All theatres',
      );
      const set = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value',
      ).set;
      set.call(select, ${JSON.stringify(theatreId)});
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 250));
    const theatreFilter = await evaluate(`(() => ({
      blocks: document.querySelectorAll('[data-schedule-id]').length,
      lens: document.body.innerText.includes('1 of 2 procedures'),
    }))()`);
    check(
      'Theatre selection narrows the board to the chosen room',
      theatreFilter.blocks === 1 && theatreFilter.lens === true,
      theatreFilter,
    );
    await evaluate(`(() => {
      const select = [...document.querySelectorAll('select')].find((item) =>
        item.options[0]?.textContent === 'All theatres',
      );
      const set = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value',
      ).set;
      set.call(select, '');
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 250));

    await evaluate('document.querySelector("[data-schedule-id]").click()');
    await waitFor(`Boolean(document.querySelector('#schedule-inspector'))`);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const inspector = await evaluate(`(() => {
      const text = document.querySelector('#schedule-inspector')?.innerText || '';
      const upper = text.toUpperCase();
      return {
        hasPatient: upper.includes('PATIENT'),
        hasSurgeon: upper.includes('SURGEON'),
        hasTheatre: upper.includes('THEATRE'),
        hasTeam: upper.includes('THEATRE TEAM'),
        hasEquipment: upper.includes('EQUIPMENT'),
        hasStatus: upper.includes('CASE STATUS'),
        hasEdit: text.includes('Edit schedule'),
      };
    })()`);
    check(
      'ADMIN case brief exposes case resources and permitted actions',
      Object.values(inspector).every(Boolean),
      inspector,
    );
    report.screenshots.push(await screenshot('admin-schedule-detail-1440.png'));
    await evaluate('window.scrollTo(0, 420)');
    await new Promise((resolve) => setTimeout(resolve, 300));
    report.screenshots.push(
      await screenshot('admin-schedule-detail-resources-1440.png'),
    );
    await evaluate('window.scrollTo(0, 0)');

    await clickText('New schedule');
    await waitFor(`Boolean(document.querySelector('[role="dialog"]'))`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const dialog = await evaluate(`(() => {
      const text = document.querySelector('[role="dialog"]')?.innerText || '';
      return {
        title: text.includes('Create schedule'),
        hasDate: Boolean(document.querySelector('[role="dialog"] input[type="date"]')),
        hasPatient: Boolean(document.querySelector('[role="dialog"] select')),
        hasProcedure: Boolean(document.querySelector('[role="dialog"] input[name="procedure"]')),
      };
    })()`);
    check(
      'ADMIN create dialog opens with required fields',
      Object.values(dialog).every(Boolean),
      dialog,
    );
    report.screenshots.push(await screenshot('admin-schedule-create-1440.png'));
    await evaluate(
      'document.querySelector(\'[aria-label="Close schedule form"]\').click()',
    );
    await waitFor(`!document.querySelector('[role="dialog"]')`);

    await viewport(1024, 768);
    await new Promise((resolve) => setTimeout(resolve, 400));
    await hideDevOverlay();
    const tablet = await evaluate(`(() => ({
      timeline: Boolean(document.querySelector('[data-schedule-timeline]')),
      agenda: Boolean(document.querySelector('[data-schedule-mobile]')),
      bodyWidth: document.body.scrollWidth,
      viewport: window.innerWidth,
    }))()`);
    check(
      'ADMIN tablet uses the time-positioned board without page overflow',
      tablet.timeline === true &&
        tablet.bodyWidth <= tablet.viewport + 1,
      tablet,
    );
    report.screenshots.push(await screenshot('admin-schedules-1024.png'));
    await evaluate(`(() => {
      const heading = document.querySelector('#theatre-day-heading');
      const top = heading.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo(0, Math.max(0, top));
      return true;
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    report.screenshots.push(
      await screenshot('admin-schedules-1024-board.png'),
    );
    await evaluate('window.scrollTo(0, 0)');

    await viewport(390, 844, true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    await hideDevOverlay();
    report.screenshots.push(await screenshot('admin-schedules-390-top.png'));
    await evaluate(`(() => {
      const heading = document.querySelector('#theatre-day-heading');
      const top = heading.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo(0, Math.max(0, top));
      return true;
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const mobile = await evaluate(`(() => ({
      agenda: Boolean(document.querySelector('[data-schedule-mobile]')),
      desktopHidden: getComputedStyle(document.querySelector('[data-schedule-timeline]')).display === 'none',
      bodyWidth: document.body.scrollWidth,
      viewport: window.innerWidth,
    }))()`);
    check(
      'ADMIN mobile uses the agenda without page overflow',
      mobile.agenda === true &&
        mobile.desktopHidden === true &&
        mobile.bodyWidth <= mobile.viewport + 1,
      mobile,
    );
    report.screenshots.push(await screenshot('admin-schedules-390.png'));

    await viewport(1440, 900);
    await navigate(`${BASE}/schedules?date=2026-11-04`);
    await waitFor(`document.body.innerText.includes('No procedures are booked')`);
    const empty = await evaluate(`(() => {
      const text = document.body.innerText;
      return {
        hasEmptyMessage: text.includes('No procedures are booked'),
        lanes: document.querySelectorAll('[data-theatre-lane]').length,
      };
    })()`);
    check(
      'Empty day keeps theatre availability visible',
      empty.hasEmptyMessage === true && empty.lanes >= 6,
      empty,
    );
    report.screenshots.push(await screenshot('admin-schedules-empty-1440.png'));

    const localToday = await evaluate(`(() => {
      const now = new Date();
      return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-');
    })()`);
    await navigate(`${BASE}/schedules?date=${localToday}`);
    await waitFor(`document.body.innerText.includes('Theatre day')`);
    await hideDevOverlay();
    const nowLine = await evaluate(`(() => {
      const board = document.querySelector('[data-schedule-timeline]');
      return {
        label: board?.innerText.includes('Now ') ?? false,
        date: document.querySelector('input[type="date"]').value,
      };
    })()`);
    check(
      'Current-time indicator is visible on today with an outlying case',
      nowLine.label === true && nowLine.date === localToday,
      nowLine,
    );
    report.screenshots.push(await screenshot('admin-schedules-today-1440.png'));

    await login(ACCOUNTS.doctor);
    await navigate(`${BASE}/schedules?date=2026-11-06`);
    await waitFor(`document.body.innerText.includes('Theatre day')`);
    await hideDevOverlay();
    const doctor = await evaluate(`(() => {
      const text = document.body.innerText;
      return {
        newSchedule: [...document.querySelectorAll('button')].some(
          (item) => (item.textContent || '').includes('New schedule'),
        ),
        blocks: document.querySelectorAll('[data-schedule-id]').length,
      };
    })()`);
    await evaluate('document.querySelector("[data-schedule-id]").click()');
    await waitFor(`Boolean(document.querySelector('#schedule-inspector'))`);
    const doctorInspector = await evaluate(
      `document.querySelector('#schedule-inspector')?.innerText || ''`,
    );
    check(
      'DOCTOR can read cases and edit/update status but cannot create',
      doctor.newSchedule === false &&
        doctor.blocks === 2 &&
        doctorInspector.includes('Edit schedule') &&
        doctorInspector.toUpperCase().includes('CASE STATUS'),
      {
        ...doctor,
        hasEdit: doctorInspector.includes('Edit schedule'),
        hasStatus: doctorInspector.toUpperCase().includes('CASE STATUS'),
      },
    );
    report.screenshots.push(await screenshot('doctor-schedules-1440.png'));

    await login(ACCOUNTS.ot);
    await navigate(`${BASE}/schedules?date=2026-11-06`);
    await waitFor(`document.body.innerText.includes('Theatre day')`);
    await hideDevOverlay();
    const ot = await evaluate(`(() => {
      const text = document.body.innerText;
      const blocks = [...document.querySelectorAll('[data-schedule-id]')];
      return {
        blocks: blocks.length,
        newSchedule: [...document.querySelectorAll('button')].some(
          (item) => (item.textContent || '').includes('New schedule'),
        ),
        assignedScope: text.includes('Assigned theatre cases only'),
      };
    })()`);
    if (ot.blocks > 0) {
      await evaluate('document.querySelector("[data-schedule-id]").click()');
      await waitFor(`Boolean(document.querySelector('#schedule-inspector'))`);
    }
    const otInspector = await evaluate(`(() => {
      const text = document.querySelector('#schedule-inspector')?.innerText || '';
      return {
        text,
        edit: text.includes('Edit schedule'),
        clinicalRestricted: text.includes('Clinical notes are not shown'),
      };
    })()`);
    check(
      'OT_STAFF is scoped to assigned cases with no management controls',
      ot.newSchedule === false &&
        ot.assignedScope === true &&
        otInspector.edit === false &&
        (ot.blocks === 0 || otInspector.clinicalRestricted === true),
      { ...ot, ...otInspector, text: undefined },
    );
    report.screenshots.push(await screenshot('ot-staff-schedules-1440.png'));

    await login(ACCOUNTS.patient);
    await navigate(`${BASE}/schedules?date=2026-11-06`);
    await waitFor(`location.pathname === '/unauthorized'`, 15_000);
    check(
      'PATIENT is redirected away from the scheduling workspace',
      (await evaluate('location.pathname')) === '/unauthorized',
      { path: await evaluate('location.pathname') },
    );
    report.screenshots.push(await screenshot('patient-unauthorized-1440.png'));

    report.finishedAt = new Date().toISOString();
    report.pass = report.checks.every((item) => item.pass);
    await writeFile(
      path.join(EVIDENCE, 'browser-schedules-checks.json'),
      `${JSON.stringify(report, null, 2)}\n`,
    );

    console.log(
      JSON.stringify(
        {
          pass: report.pass,
          checks: report.checks.map(({ name, pass, detail }) => ({
            name,
            pass,
            detail,
          })),
          screenshots: report.screenshots,
        },
        null,
        2,
      ),
    );

    if (!report.pass) process.exitCode = 1;
  } finally {
    cdp.close();
    chrome.kill();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch(async (error) => {
  chrome.kill();
  await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
  console.error(error);
  process.exitCode = 1;
});
