// Renders pages to PNG with headless Edge over the DevTools protocol.
// Run by build.py (node --experimental-websocket shot.mjs <jobs.json>); set EDGE_PATH to use another Edge location.
// jobs.json: [{ url, out, width, height, scale?, transparent?, ready? }]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForJson(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch (_) {}
    await sleep(250);
  }
  throw new Error('Edge did not start: ' + url);
}

export async function launch() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-shot-'));
  const proc = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-features=Translate',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });
  const list = await waitForJson(`http://127.0.0.1:${PORT}/json/list`);
  const page = list.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
    } else if (msg.method) listeners.forEach((l) => l(msg));
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params }));
  });
  const close = async () => { try { ws.close(); } catch (_) {} proc.kill(); await sleep(300); try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {} };
  return { send, close, listeners };
}

export async function shoot(b, job) {
  const { url, out, width, height, scale = 1, transparent = false, timeout = 20000, clip } = job;
  await b.send('Page.enable'); await b.send('Runtime.enable');
  await b.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
  await b.send('Emulation.setDefaultBackgroundColorOverride', { color: transparent ? { r: 0, g: 0, b: 0, a: 0 } : { r: 255, g: 255, b: 255, a: 1 } });
  await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const logs = [];
  const l = (m) => {
    if (m.method === 'Runtime.exceptionThrown') logs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('ERR ' + m.params.args.map((a) => a.value ?? a.description).join(' '));
  };
  b.listeners.push(l);
  await b.send('Page.navigate', { url });
  const t0 = Date.now();
  for (;;) {
    const r = await b.send('Runtime.evaluate', { expression: 'document.readyState === "complete" && (window.__READY === true || window.__READY === undefined && !window.__WAIT)', returnByValue: true });
    if (r.result.value) break;
    if (Date.now() - t0 > timeout) throw new Error('timeout waiting for ' + url);
    await sleep(150);
  }
  await sleep(job.settle ?? 250);
  const params = { format: 'png', captureBeyondViewport: false };
  if (clip) params.clip = { ...clip, scale: 1 };
  const shot = await b.send('Page.captureScreenshot', params);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  b.listeners.splice(b.listeners.indexOf(l), 1);
  console.log('wrote', out, `${width}x${height}@${scale}`, logs.length ? '\n   ' + logs.join('\n   ') : '');
}

if (process.argv[1] && process.argv[1].endsWith('shot.mjs')) {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await launch();
  try { for (const j of jobs) await shoot(b, j); } finally { await b.close(); }
}
