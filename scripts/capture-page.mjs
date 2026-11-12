#!/usr/bin/env node
/**
 * Capture a full-page screenshot with headless Chrome over CDP.
 *
 * Usage:
 *   node scripts/capture-page.mjs <url> <output.png> [width] [height] [--viewport]
 *
 * Chrome is driven directly so no browser-test dependency is added to the app.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const [url, output, widthArg = '1440', heightArg = '900'] = process.argv.slice(2);
const viewportOnly = process.argv.includes('--viewport');
const scrollSelector = process.argv.find((arg) => arg.startsWith('--scroll='))?.slice('--scroll='.length);
const waitMs = Number(
  process.argv.find((arg) => arg.startsWith('--wait='))?.slice('--wait='.length) ?? 1200,
);
const width = Number(widthArg);
const height = Number(heightArg);

if (!url || !output) {
  console.error('Usage: node scripts/capture-page.mjs <url> <output.png> [width] [height] [--viewport]');
  process.exit(1);
}

const chrome =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'medorch-shot-'));

const child = spawn(
  chrome,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--window-size=' + width + ',' + height,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);

let browserWs;
try {
  browserWs = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome CDP timeout')), 15000);
    child.stderr.on('data', (chunk) => {
      const match = String(chunk).match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    child.on('error', reject);
  });

  const ws = new WebSocket(browserWs);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const events = new Map();

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    const listeners = events.get(message.method);
    if (listeners) listeners.forEach((listener) => listener(message.params));
  });

  function send(method, params = {}, sessionId) {
    const messageId = ++id;
    return new Promise((resolve, reject) => {
      pending.set(messageId, { resolve, reject });
      ws.send(JSON.stringify({ id: messageId, method, params, sessionId }));
    });
  }

  function once(method, sessionId) {
    return new Promise((resolve) => {
      const listener = (params) => {
        events.get(method)?.delete(listener);
        resolve(params);
      };
      if (!events.has(method)) events.set(method, new Set());
      events.get(method).add(listener);
    });
  }

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', {
    targetId,
    flatten: true,
  });

  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send(
    'Emulation.setDeviceMetricsOverride',
    {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    },
    sessionId,
  );

  const loaded = once('Page.loadEventFired', sessionId);
  await send('Page.navigate', { url }, sessionId);
  await loaded;
  await new Promise((resolve) => setTimeout(resolve, waitMs));

  if (scrollSelector) {
    await send(
      'Runtime.evaluate',
      {
        expression: `(async () => {
          const el = document.querySelector(${JSON.stringify(scrollSelector)});
          if (el) el.scrollIntoView({ block: 'start' });
          await new Promise((resolve) => setTimeout(resolve, 2200));
        })()`,
        awaitPromise: true,
      },
      sessionId,
    );
  }

  // Full-page captures need below-the-fold lazy images to have decoded.
  // `content-visibility: auto` sections report placeholder heights until they
  // are rendered; force them visible so the captured page has no blank tail.
  if (!viewportOnly) {
    await send(
      'Runtime.evaluate',
      {
        expression: `document.querySelectorAll('.defer-render').forEach((el) => { el.style.contentVisibility = 'visible'; }); document.querySelectorAll('.landing-reveal').forEach((el) => { el.style.animation = 'none'; el.style.opacity = '1'; el.style.transform = 'none'; }); document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });`,
      },
      sessionId,
    );

    await send(
      'Runtime.evaluate',
      {
        expression: `(async () => {
          const step = Math.max(320, Math.floor(window.innerHeight * 0.8));
          for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 120));
          }
          window.scrollTo(0, 0);
          await Promise.all([...document.images].map((img) => img.decode?.().catch(() => {})));
          await new Promise((resolve) => setTimeout(resolve, 1400));
        })()`,
        awaitPromise: true,
      },
      sessionId,
    );

    const audit = await send(
      'Runtime.evaluate',
      {
        expression: `({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })`,
        returnByValue: true,
      },
      sessionId,
    );
    console.log(
      `width ${width}: scroll=${audit.result.value.scrollWidth} client=${audit.result.value.clientWidth}`,
    );
  }

  const metrics = await send('Page.getLayoutMetrics', {}, sessionId);
  const content = metrics.cssContentSize;
  if (!viewportOnly) {
    await send(
      'Emulation.setDeviceMetricsOverride',
      {
        width,
        height: Math.ceil(Math.max(height, content.height)),
        deviceScaleFactor: 1,
        mobile: width < 600,
      },
      sessionId,
    );
  }

  const screenshot = await send(
    'Page.captureScreenshot',
    {
      format: 'png',
      captureBeyondViewport: !viewportOnly && !scrollSelector,
      fromSurface: true,
    },
    sessionId,
  );

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, Buffer.from(screenshot.data, 'base64'));
  console.log(
    `saved ${output} (${width}x${viewportOnly ? height : Math.ceil(content.height)})`,
  );
  ws.close();
} finally {
  child.kill();
  await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
}
