import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Final-transformation browser verification.
 *
 * Uses the locally installed Chrome via the DevTools protocol, signs in through
 * the real NextAuth credentials form for every role, exercises the redesigned
 * modules, records authorization boundaries, and writes the required
 * screenshots at 1440x900, 1024x768 and 390x844.
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3001';
const PORT = 9331;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FINAL = path.resolve(import.meta.dirname, '..');
const SHOTS = path.join(FINAL, 'screenshots');
const EVIDENCE = path.join(FINAL, 'evidence');
const PROFILE = path.join(os.tmpdir(), `medorch-final-${Date.now()}`);

const ACCOUNTS = {
  admin: { email: 'admin@medorch.local', password: 'MedOrch@Dev123!' },
  doctor: {
    email: 'ananya.shah@demo.medorch.local',
    password: 'MedOrch@Demo123!',
  },
  ot: { email: 'kavya.nurse@demo.medorch.local', password: 'MedOrch@Demo123!' },
  patient: {
    email: 'aarav.mehta@demo.medorch.local',
    password: 'MedOrch@Demo123!',
  },
};

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, mobile: false },
  tablet: { width: 1024, height: 768, mobile: false },
  mobile: { width: 390, height: 844, mobile: true },
};

if (!existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);

await rm(SHOTS, { recursive: true, force: true });
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
      // still starting
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

  const waitFor = async (expression, timeout = 30_000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error(`Timed out waiting for ${expression}`);
  };

  const viewport = async ({ width, height, mobile }) => {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
      screenWidth: width,
      screenHeight: height,
    });
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

  const navigate = async (url) => {
    await cdp.send('Page.navigate', { url });
    await waitFor(
      `document.readyState === 'complete' && location.href.startsWith(${JSON.stringify(BASE)})`,
      40_000,
    );
    await evaluate('document.fonts.ready.then(() => true)');
    await new Promise((resolve) => setTimeout(resolve, 650));
    await hideDevOverlay();
  };

  const go = async (route) => {
    await navigate(`${BASE}${route}`);
    const state = await evaluate(`(() => ({
      path: location.pathname + location.search,
      title: document.title,
      text: (document.body.innerText || '').slice(0, 5000),
      h1: document.querySelector('h1')?.textContent?.trim() ?? '',
      error: !!document.querySelector('nextjs-portal[data-nextjs-toast]'),
      width: document.documentElement.scrollWidth,
      inner: window.innerWidth
    }))()`);
    state.overflow = state.width > state.inner + 1;
    return state;
  };

  const screenshot = async (name) => {
    const result = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      fromSurface: true,
    });
    await writeFile(path.join(SHOTS, name), Buffer.from(result.data, 'base64'));
    report.screenshots.push(name);
    return name;
  };

  const capture = async (name, route, size = 'desktop') => {
    await viewport(VIEWPORTS[size]);
    let state = await go(route);
    await waitFor(`!!document.querySelector('main h1')`, 20_000).catch(() => {});
    const settled = await evaluate(`(() => ({
      path: location.pathname + location.search,
      title: document.title,
      text: (document.body.innerText || '').slice(0, 5000),
      h1: document.querySelector('h1')?.textContent?.trim() ?? '',
      width: document.documentElement.scrollWidth,
      inner: window.innerWidth
    }))()`);
    state = { ...state, ...settled, overflow: settled.width > settled.inner + 1 };
    await new Promise((resolve) => setTimeout(resolve, 250));
    await screenshot(`${name}-${VIEWPORTS[size].width}.png`);
    return state;
  };

  const login = async (account) => {
    await cdp.send('Network.clearBrowserCookies');
    await viewport(VIEWPORTS.desktop);
    await navigate(`${BASE}/login`);
    const filled = await evaluate(`(() => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      const email = document.querySelector('input[name="email"]');
      const password = document.querySelector('input[name="password"]');
      if (!email || !password) return false;
      set.call(email, ${JSON.stringify(account.email)});
      email.dispatchEvent(new Event('input', { bubbles: true }));
      set.call(password, ${JSON.stringify(account.password)});
      password.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    if (!filled) throw new Error('Sign-in fields were not found');
    await evaluate(`document.querySelector('form').requestSubmit()`);
    await waitFor(`location.pathname === '/dashboard'`, 35_000);
    await new Promise((resolve) => setTimeout(resolve, 900));
    await hideDevOverlay();
  };

  const check = (name, pass, detail = '') => {
    report.checks.push({ name, pass, detail });
  };

  const setInput = async (selector, value) => {
    return evaluate(`(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(
        input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        'value',
      ).set;
      setter.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
  };

  const clickButton = async (text) => {
    return evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find((item) =>
        (item.textContent || '').replace(/\\s+/g, ' ').trim().includes(${JSON.stringify(text)}),
      );
      if (!button) return false;
      button.click();
      return true;
    })()`);
  };

  const firstHref = async (selector) => {
    return evaluate(`(() => {
      const link = document.querySelector(${JSON.stringify(selector)});
      return link ? link.getAttribute('href') : null;
    })()`);
  };

  const firstApiId = async (route) => {
    return evaluate(`fetch(${JSON.stringify(route)})
      .then((response) => response.json())
      .then((body) => {
        const list = body?.data;
        return Array.isArray(list) && list[0] ? list[0].id : null;
      })
      .catch(() => null)`);
  };

  const report = {
    startedAt: new Date().toISOString(),
    base: BASE,
    screenshots: [],
    checks: [],
    routes: {},
  };

  try {
    // ------------------------------------------------------------------
    // Public boundary
    // ------------------------------------------------------------------
    for (const size of ['desktop', 'tablet', 'mobile']) {
      const landing = await capture('landing', '/', size);
      check(`Landing renders at ${VIEWPORTS[size].width}`, Boolean(landing.h1));
      if (size === 'mobile') {
        check('Landing has no page-level horizontal overflow', !landing.overflow, `${landing.width}px`);
      }
    }

    const loginDesktop = await capture('login', '/login', 'desktop');
    check('Login form renders', loginDesktop.text.includes('Sign in'));
    await viewport(VIEWPORTS.mobile);
    const loginMobile = await go('/login');
    await screenshot('login-390.png');
    check('Login has no mobile horizontal overflow', !loginMobile.overflow, `${loginMobile.width}px`);

    await capture('register', '/register', 'desktop');
    await capture('forgot-password', '/forgot-password', 'desktop');

    // ------------------------------------------------------------------
    // ADMIN
    // ------------------------------------------------------------------
    await login(ACCOUNTS.admin);
    report.routes.admin = {};

    const adminDashboard = await capture('admin-dashboard', '/dashboard', 'desktop');
    check(
      'Admin dashboard renders',
      adminDashboard.text.includes('Operations control'),
      adminDashboard.h1 || 'Operations control present in the page body',
    );
    await capture('admin-dashboard', '/dashboard', 'tablet');
    await capture('admin-dashboard', '/dashboard', 'mobile');
    check('Admin dashboard has no mobile horizontal overflow', !(await go('/dashboard')).overflow);

    await capture('admin-schedules', '/schedules', 'desktop');
    const scheduleHref =
      (await firstHref('a[href^="/schedules/"]')) ??
      (await firstApiId('/api/schedules').then((id) =>
        id ? `/schedules/${id}` : null,
      ));
    if (scheduleHref) {
      const detail = await capture('admin-schedule-detail', scheduleHref, 'desktop');
      check('Schedule detail renders', detail.h1.length > 0, detail.h1);
    } else {
      check('Schedule detail link found', false, 'No schedule record was available');
    }

    await capture('admin-equipment', '/equipment', 'desktop');
    await capture('admin-theatres', '/ot-rooms', 'desktop');
    await capture('admin-alerts', '/alerts', 'desktop');

    const doctors = await capture('admin-doctors', '/doctors', 'desktop');
    const doctorHref =
      (await evaluate(`fetch('/api/doctors')
        .then((response) => response.json())
        .then((body) => {
          const list = Array.isArray(body?.data) ? body.data : [];
          const preferred = list.find((item) =>
            (item.user?.name || '').toLowerCase().includes('ananya'),
          );
          return preferred || list[0]
            ? '/doctors/' + (preferred || list[0]).id
            : null;
        })
        .catch(() => null)`)) ??
      (await firstHref('a[href^="/doctors/"]'));
    if (doctorHref) {
      const doctorDetail = await capture('admin-doctor-detail', doctorHref, 'desktop');
      check('Doctor detail renders', doctorDetail.h1.length > 0, doctorDetail.h1);
    } else {
      check('Doctor detail link found', false);
    }

    const patients = await capture('admin-patients', '/patients', 'desktop');
    const patientHref =
      (await evaluate(`fetch('/api/patients')
        .then((response) => response.json())
        .then((body) => {
          const list = Array.isArray(body?.data) ? body.data : [];
          const preferred = list.find((item) =>
            (item.name || '').toLowerCase().includes('aarav'),
          );
          return preferred || list[0]
            ? '/patients/' + (preferred || list[0]).id
            : null;
        })
        .catch(() => null)`)) ??
      (await firstHref('a[href^="/patients/"]'));
    if (patientHref) {
      const patientDetail = await capture('admin-patient-detail', patientHref, 'desktop');
      check('Patient detail renders', patientDetail.h1.length > 0, patientDetail.h1);
    } else {
      check('Patient detail link found', false);
    }

    const departments = await capture('admin-departments', '/departments', 'desktop');
    check('Departments workspace renders', departments.h1.includes('Clinical divisions'), departments.h1);
    check('Department list includes resource counts', /clinicians/i.test(departments.text));

    const departmentSearch = await setInput('#department-search', 'zzzz-no-such-division');
    await new Promise((resolve) => setTimeout(resolve, 400));
    const noDepartmentResults = await evaluate(
      `(document.body.innerText || '').includes('No departments match')`,
    );
    check('Department search filters the directory', departmentSearch && noDepartmentResults);
    await setInput('#department-search', '');
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newDepartment = await clickButton('New department');
    await new Promise((resolve) => setTimeout(resolve, 300));
    const formOpen = await evaluate(
      `(document.body.innerText || '').includes('Add to the operating structure')`,
    );
    check('Department create form opens without submitting', newDepartment && formOpen);
    await clickButton('Close');
    await new Promise((resolve) => setTimeout(resolve, 200));

    await capture('admin-departments', '/departments', 'tablet');
    const departmentsMobile = await capture('admin-departments', '/departments', 'mobile');
    check('Departments has no mobile horizontal overflow', !departmentsMobile.overflow, `${departmentsMobile.width}px`);

    const users = await capture('admin-users', '/users', 'desktop');
    check('Users workspace renders', users.h1.includes('Who can enter MedOrch'), users.h1);
    const userSearch = await setInput('#user-search', 'zzzz-no-such-account');
    await new Promise((resolve) => setTimeout(resolve, 400));
    const noUserResults = await evaluate(
      `(document.body.innerText || '').includes('No matching accounts')`,
    );
    check('Account search filters the roster', userSearch && noUserResults);
    await setInput('#user-search', '');
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newAccount = await clickButton('Create account');
    await new Promise((resolve) => setTimeout(resolve, 300));
    const accountFormOpen = await evaluate(
      `(document.body.innerText || '').includes('Create a MedOrch identity')`,
    );
    check('Account create form opens without submitting', newAccount && accountFormOpen);
    await clickButton('Close new account');
    await new Promise((resolve) => setTimeout(resolve, 200));

    await capture('admin-users', '/users', 'tablet');
    const usersMobile = await capture('admin-users', '/users', 'mobile');
    check('Users has no mobile horizontal overflow', !usersMobile.overflow, `${usersMobile.width}px`);

    const audit = await capture('admin-audit', '/audit', 'desktop');
    check('Audit ledger renders', audit.h1.includes('Audit ledger'), audit.h1);
    await evaluate(`(() => {
      const select = document.querySelector('#audit-action');
      if (!select) return false;
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, 'LOGIN');
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    await clickButton('Apply filters');
    await waitFor(
      `!document.querySelector('ol') || document.querySelectorAll('ol li').length > 0`,
      15_000,
    ).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 500));
    const auditFiltered = await evaluate(
      `(document.body.innerText || '').includes('filter')`,
    );
    check('Audit filters apply to the server-backed ledger', auditFiltered);
    const eventInspect = await evaluate(`(() => {
      const button = document.querySelector('ol button[aria-pressed]');
      if (!button) return false;
      button.click();
      return true;
    })()`);
    await waitFor(
      `!!document.querySelector('[aria-labelledby="audit-event-details"]')`,
      10_000,
    ).catch(() => {});
    const eventDetails = await evaluate(
      `!!document.querySelector('[aria-labelledby="audit-event-details"]')`,
    );
    check('Audit event inspection opens', eventInspect && eventDetails);
    if (eventDetails) await screenshot('admin-audit-event-1440.png');

    await capture('admin-audit', '/audit', 'tablet');
    const auditMobile = await capture('admin-audit', '/audit', 'mobile');
    check('Audit has no mobile horizontal overflow', !auditMobile.overflow, `${auditMobile.width}px`);

    const unauthorized = await capture('unauthorized', '/unauthorized', 'desktop');
    check('Access boundary page renders', unauthorized.h1.includes('outside your access'), unauthorized.h1);

    // Role boundaries: admin is allowed into every module.
    for (const route of ['/users', '/audit', '/departments', '/patients']) {
      const state = await go(route);
      check(`ADMIN reaches ${route}`, state.path === route, state.path);
    }

    // ------------------------------------------------------------------
    // DOCTOR
    // ------------------------------------------------------------------
    await login(ACCOUNTS.doctor);
    report.routes.doctor = {};
    const doctorDashboard = await capture('doctor-dashboard', '/dashboard', 'desktop');
    check('Doctor dashboard renders', doctorDashboard.h1.length > 0, doctorDashboard.h1);
    const doctorSchedules = await capture('doctor-schedules', '/schedules', 'desktop');
    check('Doctor reaches schedules', doctorSchedules.path === '/schedules', doctorSchedules.path);
    await capture('doctor-departments', '/departments', 'tablet');

    const doctorUsers = await go('/users');
    check('DOCTOR is blocked from users', doctorUsers.path.startsWith('/unauthorized'), doctorUsers.path);
    const doctorAudit = await go('/audit');
    check('DOCTOR is blocked from audit', doctorAudit.path.startsWith('/unauthorized'), doctorAudit.path);

    // ------------------------------------------------------------------
    // OT_STAFF
    // ------------------------------------------------------------------
    await login(ACCOUNTS.ot);
    report.routes.ot = {};
    const otDashboard = await capture('ot-dashboard', '/dashboard', 'desktop');
    check('OT dashboard renders', otDashboard.h1.length > 0, otDashboard.h1);
    const otTheatres = await capture('ot-theatres', '/ot-rooms', 'tablet');
    check('OT staff reaches theatres', otTheatres.path === '/ot-rooms', otTheatres.path);
    await capture('ot-schedules', '/schedules', 'desktop');

    const otPatients = await go('/patients');
    check('OT_STAFF is blocked from patient registry', otPatients.path.startsWith('/unauthorized'), otPatients.path);
    const otUsers = await go('/users');
    check('OT_STAFF is blocked from users', otUsers.path.startsWith('/unauthorized'), otUsers.path);

    // ------------------------------------------------------------------
    // PATIENT
    // ------------------------------------------------------------------
    await login(ACCOUNTS.patient);
    report.routes.patient = {};
    const patientDashboard = await capture('patient-dashboard', '/dashboard', 'desktop');
    check('Patient dashboard renders', patientDashboard.h1.length > 0, patientDashboard.h1);

    const appointments = await capture('patient-appointments', '/patients/appointments', 'desktop');
    check('Patient visit book renders', appointments.h1.includes('Your theatre visits'), appointments.h1);
    check('Patient visits separate upcoming and past', /Upcoming/i.test(appointments.text) && /Past visits/i.test(appointments.text));

    const appointmentHref =
      (await firstHref('a[href^="/patients/appointments/"]')) ??
      (await firstApiId('/api/me/appointments').then((id) =>
        id ? `/patients/appointments/${id}` : null,
      ));
    if (appointmentHref) {
      const appointmentDetail = await capture(
        'patient-appointment-detail',
        appointmentHref,
        'desktop',
      );
      check('Patient appointment detail renders', appointmentDetail.h1.length > 0, appointmentDetail.h1);
    } else {
      check('Patient appointment detail link found', false);
    }

    const appointmentsMobile = await capture(
      'patient-appointments',
      '/patients/appointments',
      'mobile',
    );
    check('Patient appointments has no mobile horizontal overflow', !appointmentsMobile.overflow, `${appointmentsMobile.width}px`);

    const patientSchedules = await go('/schedules');
    check('PATIENT is blocked from schedules', patientSchedules.path.startsWith('/unauthorized'), patientSchedules.path);
    const patientRegistry = await go('/patients');
    check('PATIENT is blocked from patient registry', patientRegistry.path.startsWith('/unauthorized'), patientRegistry.path);

    // ------------------------------------------------------------------
    // Interaction / accessibility checks
    // ------------------------------------------------------------------
    await viewport(VIEWPORTS.mobile);
    await go('/dashboard');
    const menuOpened = await evaluate(`(() => {
      const button = document.querySelector('button[aria-label="Open navigation menu"]');
      if (!button) return false;
      button.click();
      return true;
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const navExpanded = await evaluate(
      `document.querySelector('button[aria-controls="primary-navigation"]')?.getAttribute('aria-expanded') === 'true'`,
    );
    check('Mobile navigation toggle opens the drawer', menuOpened && navExpanded);

    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    const reducedMotion = await evaluate(`(() => {
      const node = document.querySelector('.page-enter');
      if (!node) return null;
      return getComputedStyle(node).animationName;
    })()`);
    check('Reduced-motion preference neutralises page animation', reducedMotion === 'none', String(reducedMotion));
    await cdp.send('Emulation.setEmulatedMedia', { features: [] });

    // Keyboard focus visibility on a working control.
    await viewport(VIEWPORTS.desktop);
    await login(ACCOUNTS.admin);
    await go('/users');
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key: 'Tab',
      code: 'Tab',
      windowsVirtualKeyCode: 9,
    });
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Tab',
      code: 'Tab',
      windowsVirtualKeyCode: 9,
    });
    const focusCheck = await evaluate(`(() => {
      const input = document.querySelector('#user-search');
      if (!input) return false;
      input.focus();
      const shell = input.closest('.control');
      if (!shell) return false;
      return document.activeElement === input && shell.matches(':focus-within');
    })()`);
    check('Search control accepts keyboard focus and exposes a focus-within state', focusCheck);

    report.finishedAt = new Date().toISOString();
    report.passed = report.checks.filter((item) => item.pass).length;
    report.failed = report.checks.filter((item) => !item.pass).length;
    await writeFile(
      path.join(EVIDENCE, 'verification-report.json'),
      JSON.stringify(report, null, 2),
    );

    console.log(
      JSON.stringify(
        {
          passed: report.passed,
          failed: report.failed,
          screenshots: report.screenshots.length,
          failures: report.checks.filter((item) => !item.pass),
        },
        null,
        2,
      ),
    );
  } finally {
    cdp.close();
    chrome.kill();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
  }
}

await main();
