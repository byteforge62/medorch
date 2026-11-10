import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../../src/generated/prisma/client.ts';

const BASE = 'http://localhost:3000';
const PORT = 9225;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const STAGE = path.resolve(HERE, '..');
const SHOTS = path.join(STAGE, 'screenshots');
const EVIDENCE = path.join(STAGE, 'evidence');
const PROFILE = path.join(os.tmpdir(), `medorch-conflicts-${Date.now()}`);
const MARKER = 'Stage 3D conflict fixture';
const DATE = '2026-11-10';

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

async function cleanupFixtures() {
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

async function buildFixtures() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@medorch.local' },
    select: { id: true },
  });
  const department = await prisma.department.findFirst({
    where: { name: 'General Surgery' },
    select: { id: true },
  });
  const rooms = await prisma.oTRoom.findMany({
    where: { code: { in: ['DEMO-GEN-01', 'DEMO-GEN-02'] } },
    orderBy: { code: 'asc' },
    select: { id: true, code: true },
  });
  const surgeons = await prisma.user.findMany({
    where: {
      role: 'DOCTOR',
      status: 'ACTIVE',
      name: {
        in: ['Dr. Ananya Shah', 'Dr. Rohan Patel'],
      },
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  const patients = await prisma.patient.findMany({
    orderBy: { patientCode: 'asc' },
    take: 2,
    select: { id: true, name: true },
  });
  const staff = await prisma.user.findUnique({
    where: { email: 'kavya.nurse@demo.medorch.local' },
    select: { id: true, name: true },
  });
  const equipment = await prisma.equipment.findFirst({
    where: { name: { contains: 'Anaesthesia Workstation' } },
    select: { id: true, name: true },
  });

  if (
    !admin ||
    !department ||
    rooms.length < 2 ||
    surgeons.length < 2 ||
    patients.length < 2 ||
    !staff ||
    !equipment
  ) {
    throw new Error('Conflict fixture prerequisites are missing');
  }

  const specs = [
    {
      procedure: `${MARKER} A`,
      roomId: rooms[0].id,
      surgeonId: surgeons[0].id,
      patientId: patients[0].id,
      startTime: '2026-11-10T09:00:00.000Z',
      endTime: '2026-11-10T10:00:00.000Z',
    },
    {
      procedure: `${MARKER} B`,
      roomId: rooms[1].id,
      surgeonId: surgeons[1].id,
      patientId: patients[1].id,
      startTime: '2026-11-10T09:30:00.000Z',
      endTime: '2026-11-10T10:30:00.000Z',
    },
  ];

  const created = [];

  for (const spec of specs) {
    const schedule = await prisma.schedule.create({
      data: {
        patientId: spec.patientId,
        departmentId: department.id,
        otRoomId: spec.roomId,
        surgeonId: spec.surgeonId,
        createdById: admin.id,
        procedure: spec.procedure,
        scheduledDate: new Date(`${DATE}T00:00:00.000Z`),
        startTime: new Date(spec.startTime),
        endTime: new Date(spec.endTime),
        status: 'CONFIRMED',
        priority: 'URGENT',
        staff: {
          create: [{ userId: staff.id, role: 'NURSE' }],
        },
        equipment: {
          create: [{ equipmentId: equipment.id }],
        },
      },
      select: { id: true },
    });
    created.push(schedule);
  }

  return {
    schedules: created,
    rooms: rooms.map((room) => room.code),
    surgeons: surgeons.map((surgeon) => surgeon.name),
    patients: patients.map((patient) => patient.name),
    staff: staff.name,
    equipment: equipment.name,
  };
}

const report = {
  startedAt: new Date().toISOString(),
  marker: MARKER,
  checks: [],
  screenshots: [],
};
const check = (name, pass, detail) =>
  report.checks.push({ name, pass, detail });

async function runBrowser() {
  await waitForDebugger();
  const target = await (
    await fetch(
      `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent('about:blank')}`,
      { method: 'PUT' },
    )
  ).json();
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
    await new Promise((resolve) => setTimeout(resolve, 700));
    await evaluate(`(() => {
      for (const node of document.querySelectorAll(
        'nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button]',
      )) node.style.display = 'none';
      return true;
    })()`);
  };

  try {
    await navigate(`${BASE}/login`);
    await evaluate(`(() => {
      const set = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      const email = document.querySelector('input[name="email"]');
      const password = document.querySelector('input[name="password"]');
      set.call(email, 'admin@medorch.local');
      email.dispatchEvent(new Event('input', { bubbles: true }));
      set.call(password, 'MedOrch@Dev123!');
      password.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await evaluate('document.querySelector("form").requestSubmit()');
    await waitFor(`location.pathname === '/dashboard'`, 25_000);

    await navigate(`${BASE}/schedules?date=${DATE}`);
    await waitFor(
      `document.body.innerText.includes('Staff double-allocated')`,
    );

    const panel = await evaluate(`(() => {
      const text = document.body.innerText;
      return {
        blocks: document.querySelectorAll('[data-schedule-id]').length,
        staff: text.includes('Staff double-allocated'),
        equipment: text.includes('Equipment double-allocated'),
        confirmedCount: text.includes('2 confirmed'),
        warnings: text.includes('0 warnings'),
      };
    })()`);
    check(
      'Live coordination panel shows both overlapping allocations',
      panel.blocks === 2 &&
        panel.staff &&
        panel.equipment &&
        panel.confirmedCount &&
        panel.warnings,
      panel,
    );

    await evaluate(`(() => {
      const row = [...document.querySelectorAll('button')].find((item) =>
        (item.textContent || '').includes('Staff double-allocated'),
      );
      row.click();
      return true;
    })()`);
    await waitFor(`Boolean(document.querySelector('#schedule-inspector'))`);
    const inspector = await evaluate(
      `document.querySelector('#schedule-inspector').innerText`,
    );
    check(
      'Confirmed conflict opens the affected case brief',
      inspector.includes(MARKER) &&
        inspector.includes('Staff double-allocated'),
      {
        hasFixture: inspector.includes(MARKER),
        hasConflict: inspector.includes('Staff double-allocated'),
      },
    );

    await evaluate(`(() => {
      const heading = document.querySelector('#schedule-conflicts-heading');
      const top = heading.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo(0, Math.max(0, top));
      return true;
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 350));

    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      fromSurface: true,
    });
    await writeFile(
      path.join(SHOTS, 'admin-schedules-conflicts-1440.png'),
      Buffer.from(shot.data, 'base64'),
    );
    report.screenshots.push('admin-schedules-conflicts-1440.png');
  } finally {
    cdp.close();
    chrome.kill();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
  }
}

try {
  await cleanupFixtures();
  const before = await prisma.schedule.count();

  try {
    const fixture = await buildFixtures();
    report.fixture = fixture;
    await runBrowser();
  } finally {
    report.cleanup = {
      removedScheduleIds: await cleanupFixtures(),
    };
  }

  const after = await prisma.schedule.count();
  report.cleanup.scheduleCountBefore = before;
  report.cleanup.scheduleCountAfter = after;
  report.checks.push({
    name: 'Conflict fixtures removed and schedule count restored',
    pass: before === after,
    detail: report.cleanup,
  });
  report.finishedAt = new Date().toISOString();
  report.pass = report.checks.every((item) => item.pass);
  await writeFile(
    path.join(EVIDENCE, 'conflict-checks.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) process.exitCode = 1;
} catch (error) {
  const cleaned = await cleanupFixtures().catch(() => []);
  console.error(error);
  console.error({ cleaned });
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
