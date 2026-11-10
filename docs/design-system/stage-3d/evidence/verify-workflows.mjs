import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../../src/generated/prisma/client.ts';

const BASE = 'http://localhost:3000';
const PORT = 9224;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const STAGE = path.resolve(HERE, '..');
const SHOTS = path.join(STAGE, 'screenshots');
const EVIDENCE = path.join(STAGE, 'evidence');
const PROFILE = path.join(os.tmpdir(), `medorch-workflow-${Date.now()}`);
const MARKER = 'Stage 3D verification case';
const CREATE_DATE = '2026-11-08';

const admin = {
  email: 'admin@medorch.local',
  password: 'MedOrch@Dev123!',
};
const doctor = {
  email: 'ananya.shah@demo.medorch.local',
  password: 'MedOrch@Demo123!',
};

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

if (!existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);
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

const report = {
  startedAt: new Date().toISOString(),
  marker: MARKER,
  checks: [],
  screenshots: [],
};

const check = (name, pass, detail) => {
  report.checks.push({ name, pass, detail });
};

let createdId = null;

async function cleanup() {
  const schedules = await prisma.schedule.findMany({
    where: { procedure: { startsWith: MARKER } },
    select: { id: true },
  });

  for (const { id } of schedules) {
    await prisma.$transaction([
      prisma.auditLog.deleteMany({ where: { entityId: id } }),
      prisma.scheduleStaff.deleteMany({ where: { scheduleId: id } }),
      prisma.scheduleEquipment.deleteMany({ where: { scheduleId: id } }),
      prisma.scheduleNote.deleteMany({ where: { scheduleId: id } }),
      prisma.alert.deleteMany({ where: { scheduleId: id } }),
      prisma.schedule.delete({ where: { id } }),
    ]);
  }

  return schedules.map((item) => item.id);
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
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1440,
    screenHeight: 900,
  });

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

  const navigate = async (url) => {
    await cdp.send('Page.navigate', { url });
    await waitFor(
      `document.readyState === 'complete' && location.href.startsWith(${JSON.stringify(BASE)})`,
    );
    await evaluate('document.fonts.ready.then(() => true)');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await evaluate(`(() => {
      for (const node of document.querySelectorAll(
        'nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button]',
      )) node.style.display = 'none';
      return true;
    })()`);
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
    await new Promise((resolve) => setTimeout(resolve, 200));
    await evaluate('document.querySelector("form").requestSubmit()');
    await waitFor(`location.pathname === '/dashboard'`, 25_000);
  };

  const screenshot = async (name) => {
    const result = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      fromSurface: true,
    });
    await writeFile(
      path.join(SHOTS, name),
      Buffer.from(result.data, 'base64'),
    );
    report.screenshots.push(name);
  };

  const clickButton = async (text, selector = 'button') => {
    return evaluate(`(() => {
      const button = [...document.querySelectorAll(${JSON.stringify(selector)})].find(
        (item) => (item.textContent || '').trim().includes(${JSON.stringify(text)}),
      );
      if (!button) return false;
      button.click();
      return true;
    })()`);
  };

  try {
    await login(admin);
    await navigate(`${BASE}/schedules?date=${CREATE_DATE}`);
    await waitFor(`document.body.innerText.includes('Theatre day')`);

    await clickButton('New schedule');
    await waitFor(`Boolean(document.querySelector('[role="dialog"]'))`);

    await evaluate(`(() => {
      const setInput = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      const setSelect = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value',
      ).set;
      const dialog = document.querySelector('[role="dialog"]');
      const setValue = (element, value) => {
        if (element.tagName === 'SELECT') setSelect.call(element, value);
        else setInput.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };

      setValue(
        dialog.querySelector('input[name="procedure"]'),
        ${JSON.stringify(MARKER)},
      );

      const selects = [...dialog.querySelectorAll('select')];
      setValue(selects[0], selects[0].options[1].value);

      const department = [...selects[2].options].find((option) =>
        option.textContent.includes('General Surgery'),
      );
      setValue(selects[2], department.value);

      return true;
    })()`);

    await new Promise((resolve) => setTimeout(resolve, 450));

    await evaluate(`(() => {
      const setInput = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      const setSelect = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value',
      ).set;
      const dialog = document.querySelector('[role="dialog"]');
      const setValue = (element, value) => {
        if (element.tagName === 'SELECT') setSelect.call(element, value);
        else setInput.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const selects = [...dialog.querySelectorAll('select')];

      const surgeon = [...selects[1].options].find((option) =>
        option.textContent.includes('Ananya Shah'),
      );
      setValue(selects[1], surgeon.value);

      const room = [...selects[3].options].find((option) =>
        option.textContent.includes('DEMO-GEN-01'),
      );
      if (!room || room.disabled) throw new Error('Available room not found');
      setValue(selects[3], room.value);

      setValue(
        dialog.querySelector('input[type="date"]'),
        ${JSON.stringify(CREATE_DATE)},
      );
      const times = [...dialog.querySelectorAll('input[type="time"]')];
      setValue(times[0], '20:00');
      setValue(times[1], '20:30');
      return true;
    })()`);

    await screenshot('admin-schedule-create-filled-1440.png');

    await evaluate(`(() => {
      const set = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      const times = [
        ...document.querySelectorAll('[role="dialog"] input[type="time"]'),
      ];
      set.call(times[1], '20:00');
      times[1].dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    const beforeValidation = await prisma.schedule.count();
    await clickButton('Create schedule', '[role="dialog"] button[type="submit"]');
    await waitFor(
      `document.querySelector('[role="dialog"] [role="alert"]')?.innerText.includes('End time must be after start time')`,
      5_000,
    );
    const validation = {
      message: await evaluate(
        `document.querySelector('[role="dialog"] [role="alert"]').innerText`,
      ),
      count: await prisma.schedule.count(),
      stillOpen: await evaluate(
        `Boolean(document.querySelector('[role="dialog"]'))`,
      ),
    };
    check(
      'Invalid end time is rejected in the form without writing a record',
      validation.message.includes('End time must be after start time') &&
        validation.count === beforeValidation &&
        validation.stillOpen === true,
      validation,
    );

    await evaluate(`(() => {
      const set = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      const times = [
        ...document.querySelectorAll('[role="dialog"] input[type="time"]'),
      ];
      set.call(times[1], '20:30');
      times[1].dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);

    const beforeCreate = await prisma.schedule.count();
    await clickButton('Create schedule', '[role="dialog"] button[type="submit"]');
    await waitFor(`!document.querySelector('[role="dialog"]')`, 20_000);
    await new Promise((resolve) => setTimeout(resolve, 1_800));

    const created = await prisma.schedule.findFirst({
      where: { procedure: MARKER },
      select: {
        id: true,
        status: true,
        startTime: true,
        endTime: true,
        patient: { select: { name: true } },
        surgeon: { select: { name: true } },
        otRoom: { select: { code: true } },
      },
    });
    createdId = created?.id ?? null;

    check(
      'ADMIN created a schedule through the existing form/API',
      Boolean(created) && (await prisma.schedule.count()) === beforeCreate + 1,
      created,
    );

    if (!created) throw new Error('Disposable schedule was not created');

    await navigate(`${BASE}/schedules?date=${CREATE_DATE}`);
    await waitFor(`document.body.innerText.includes(${JSON.stringify(MARKER)})`);
    await evaluate(`(() => {
      const block = [...document.querySelectorAll('[data-schedule-id]')].find(
        (item) => item.textContent.includes(${JSON.stringify(MARKER)}),
      );
      block.click();
      return true;
    })()`);
    await waitFor(`Boolean(document.querySelector('#schedule-inspector'))`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const createdInspector = await evaluate(
      `document.querySelector('#schedule-inspector').innerText`,
    );
    check(
      'Created case appears in the timeline with its selected resources',
      createdInspector.includes(MARKER) &&
        createdInspector.includes('DEMO-GEN-01') &&
        createdInspector.includes('Dr. Ananya Shah'),
      { hasMarker: createdInspector.includes(MARKER) },
    );
    await screenshot('admin-created-case-1440.png');

    await clickButton('Edit schedule');
    await waitFor(`Boolean(document.querySelector('[role="dialog"]'))`);
    await evaluate(`(() => {
      const set = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      const input = document.querySelector(
        '[role="dialog"] input[name="procedure"]',
      );
      set.call(input, ${JSON.stringify(`${MARKER} edited`)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await clickButton('Save changes', '[role="dialog"] button[type="submit"]');
    await waitFor(`!document.querySelector('[role="dialog"]')`, 20_000);
    await new Promise((resolve) => setTimeout(resolve, 1_500));

    const edited = await prisma.schedule.findUnique({
      where: { id: createdId },
      select: { procedure: true },
    });
    check(
      'ADMIN edited the disposable schedule through the existing form/API',
      edited?.procedure === `${MARKER} edited`,
      edited,
    );

    await login(doctor);
    await navigate(`${BASE}/schedules?date=${CREATE_DATE}`);
    await waitFor(
      `document.body.innerText.includes(${JSON.stringify(`${MARKER} edited`)})`,
    );
    await evaluate(`(() => {
      const block = [...document.querySelectorAll('[data-schedule-id]')].find(
        (item) => item.textContent.includes(${JSON.stringify(`${MARKER} edited`)}),
      );
      block.click();
      return true;
    })()`);
    await waitFor(`Boolean(document.querySelector('#schedule-inspector'))`);
    await clickButton('Confirm', '#schedule-inspector button');
    await waitFor(
      `document.querySelector('#schedule-inspector')?.innerText.includes('Start procedure')`,
      15_000,
    );
    await new Promise((resolve) => setTimeout(resolve, 1_200));

    const confirmed = await prisma.schedule.findUnique({
      where: { id: createdId },
      select: { status: true },
    });
    check(
      'DOCTOR updated the disposable case status through the inspector',
      confirmed?.status === 'CONFIRMED',
      confirmed,
    );
    await screenshot('doctor-confirmed-case-1440.png');

    await login(admin);
    await navigate(`${BASE}/schedules?date=${CREATE_DATE}`);
    await waitFor(
      `document.body.innerText.includes(${JSON.stringify(`${MARKER} edited`)})`,
    );
    await evaluate(`(() => {
      const block = [...document.querySelectorAll('[data-schedule-id]')].find(
        (item) => item.textContent.includes(${JSON.stringify(`${MARKER} edited`)}),
      );
      block.click();
      return true;
    })()`);
    await waitFor(`Boolean(document.querySelector('#schedule-inspector'))`);
    await clickButton('Cancel', '#schedule-inspector button');
    await waitFor(`Boolean(document.querySelector('[role="dialog"]'))`);
    await clickButton(
      'Cancel schedule',
      '[role="dialog"] button',
    );
    await waitFor(
      `document.querySelector('#schedule-inspector')?.innerText.includes('This case is closed')`,
      15_000,
    );
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    const cancelled = await prisma.schedule.findUnique({
      where: { id: createdId },
      select: { status: true },
    });
    const closed = await evaluate(`(() => {
      const text = document.querySelector('#schedule-inspector')?.innerText || '';
      return {
        closed: text.includes('This case is closed'),
        noEdit: !text.includes('Edit schedule'),
        noStatus: !text.includes('Case status'),
      };
    })()`);
    check(
      'ADMIN cancelled the case and terminal controls are hidden',
      cancelled?.status === 'CANCELLED' &&
        closed.closed &&
        closed.noEdit &&
        closed.noStatus,
      { status: cancelled?.status, ...closed },
    );
    await screenshot('admin-cancelled-case-1440.png');
  } finally {
    cdp.close();
    chrome.kill();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
  }
}

try {
  await cleanup();
  const before = await prisma.schedule.count();
  const beforeStatuses = await prisma.schedule.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  await main();

  const cleaned = await cleanup();
  const after = await prisma.schedule.count();
  const afterStatuses = await prisma.schedule.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  report.cleanup = {
    removedScheduleIds: cleaned,
    scheduleCountBefore: before,
    scheduleCountAfter: after,
    statusesBefore: beforeStatuses,
    statusesAfter: afterStatuses,
  };
  report.checks.push({
    name: 'Disposable records were removed and seeded schedule state restored',
    pass: before === after && cleaned.length > 0,
    detail: report.cleanup,
  });
  report.finishedAt = new Date().toISOString();
  report.pass = report.checks.every((item) => item.pass);
  await writeFile(
    path.join(EVIDENCE, 'workflow-checks.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) process.exitCode = 1;
} catch (error) {
  const cleaned = await cleanup().catch(() => []);
  console.error(error);
  console.error({ cleaned });
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
