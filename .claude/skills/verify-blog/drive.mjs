#!/usr/bin/env node
// Drive the blog in headless Google Chrome over CDP (no npm deps) and save a screenshot.
// Steps run in the order given:
//   drive.mjs <url> <out.png> [--width 1280] [--click <css>] [--type <css> <text>]
//                             [--wait <ms>] [--eval <js expr>] [--shot <out2.png>] [--full]
// --eval prints the JSON value to stdout. --shot saves a mid-journey screenshot; <out.png> is the final screen.
// Exit 1 if a selector is missing or Chrome fails.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, out, ...rest] = process.argv.slice(2);
if (!url || !out) { console.error(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 6).join('\n')); process.exit(1); }

let width = 1280, full = false;
const steps = [];
for (let i = 0; i < rest.length; i++) {
  const f = rest[i];
  if (f === '--width') width = +rest[++i];
  else if (f === '--full') full = true;
  else if (f === '--click') steps.push(['click', rest[++i]]);
  else if (f === '--type') steps.push(['type', rest[++i], rest[++i]]);
  else if (f === '--wait') steps.push(['wait', +rest[++i]]);
  else if (f === '--eval') steps.push(['eval', rest[++i]]);
  else if (f === '--shot') steps.push(['shot', rest[++i]]);
  else { console.error(`unknown flag ${f}`); process.exit(1); }
}

const profile = mkdtempSync(join(tmpdir(), 'verify-blog-chrome-')); // fresh profile: no stale service worker
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', `--window-size=${width},900`, 'about:blank'], { stdio: 'ignore' });
const done = async (code) => {
  const exited = new Promise((r) => chrome.once('exit', r));
  chrome.kill(); await Promise.race([exited, new Promise((r) => setTimeout(r, 3000))]);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  process.exit(code);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  const port = readFileSync(portFile, 'utf8').split('\n')[0];
  const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const pending = new Map(); const waiters = [];
  ws.addEventListener('message', ({ data }) => {
    const m = JSON.parse(data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method) waiters.filter((w) => w.method === m.method).forEach((w) => w.resolve(m));
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id; pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const once = (method) => new Promise((resolve) => waiters.push({ method, resolve }));
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval failed');
    return r.result.value;
  };
  const need = async (css) => {
    if (!(await evaluate(`!!document.querySelector(${JSON.stringify(css)})`))) throw new Error(`no element: ${css}`);
  };

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
  const loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url });
  await loaded; await sleep(500);

  const capture = async (file) => {
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full });
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.error(`saved ${file}`);
  };

  for (const [kind, a, b] of steps) {
    if (kind === 'wait') await sleep(a);
    else if (kind === 'shot') await capture(a);
    else if (kind === 'eval') console.log(JSON.stringify(await evaluate(a), null, 2));
    else if (kind === 'click') {
      await need(a);
      const nav = once('Page.loadEventFired');
      await evaluate(`document.querySelector(${JSON.stringify(a)}).click()`);
      await Promise.race([nav, sleep(1500)]); await sleep(300);
    } else if (kind === 'type') {
      await need(a);
      await evaluate(`document.querySelector(${JSON.stringify(a)}).focus()`);
      for (const ch of b) {                       // real key events so keydown/input/keyup handlers fire
        await send('Input.dispatchKeyEvent', { type: 'keyDown', text: ch, key: ch });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch });
      }
      await sleep(800);
    }
  }
  await capture(out);
  await done(0);
} catch (e) { console.error(String(e)); await done(1); }
