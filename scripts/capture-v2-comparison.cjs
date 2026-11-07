const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const phase = process.argv[2] || 'after';
if (!['before', 'after'].includes(phase)) throw new Error('Use before or after');
const output = path.resolve(`docs/design-v2/${phase}`);
const base = process.env.CAMPUS_URL || 'http://localhost:8081';
const key = 'campus-conectado/tasks/v1';
const shots = [];
const errors = [];
let browser;
let galleryServer;

(async () => {
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  if (phase === 'before') {
    const root = path.resolve('docs/design-review/2026-11-07-atual');
    galleryServer = http.createServer((req, res) => {
      const target = path.resolve(root, `.${decodeURIComponent((req.url || '/').split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0])}`);
      if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) { res.writeHead(404); return res.end(); }
      res.setHeader('Content-Type', target.endsWith('.html') ? 'text/html; charset=utf-8' : target.endsWith('.png') ? 'image/png' : 'text/plain; charset=utf-8');
      fs.createReadStream(target).pipe(res);
    });
    await new Promise(resolve => galleryServer.listen(0, '127.0.0.1', resolve));
    const galleryPage = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
    await galleryPage.goto(`http://127.0.0.1:${galleryServer.address().port}`, { waitUntil: 'networkidle' });
    await galleryPage.screenshot({ path: path.join(output, 'galeria-baseline.png') });
    await galleryPage.close();
    await new Promise(resolve => galleryServer.close(resolve));
    galleryServer = null;
  }
  for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    async function shot(name) {
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      const filename = `${viewport.width}-${name}.png`;
      await page.screenshot({ path: path.join(output, filename) });
      const edit = page.getByRole('button', { name: /^Editar atividade / }).first();
      const firstTask = await edit.count() ? await edit.boundingBox() : null;
      shots.push({ file: filename, viewport, state: name, firstTask });
    }
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForFunction(storageKey => !!localStorage.getItem(storageKey), key);
    const raw = await page.evaluate(storageKey => localStorage.getItem(storageKey), key);
    await shot('inicio');
    await page.goto(`${base}/activities`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('tab', { name: /Todas/ })).toBeVisible();
    await shot('atividades');
    await page.goto(`${base}/task-form`, { waitUntil: 'networkidle' });
    await expect(page.getByLabel('Título da atividade', { exact: true })).toBeVisible();
    await shot('formulario');
    await page.evaluate(storageKey => localStorage.setItem(storageKey, JSON.stringify({ version: 1, tasks: [] })), key);
    await page.goto(`${base}/activities`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await shot('vazio');
    await page.evaluate(storageKey => localStorage.setItem(storageKey, '{corrompido'), key);
    await page.goto(`${base}/activities`, { waitUntil: 'networkidle' });
    await expect(page.getByText(/corrompidos e não foram alterados/)).toBeVisible();
    await shot('erro');
    await page.evaluate(({ storageKey, value }) => { const data = JSON.parse(value); data.tasks.forEach(t => t.completed = true); localStorage.setItem(storageKey, JSON.stringify(data)); }, { storageKey: key, value: raw });
    await page.goto(base, { waitUntil: 'networkidle' });
    await shot('tudo-concluido');
    await context.close();
  }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({ phase, capturedAt: new Date().toISOString(), platform: 'web', nativeScreenshots: false, errors, screenshots: shots }, null, 2));
  await browser.close();
  if (errors.length) throw new Error(JSON.stringify(errors));
  console.log(`${phase}: ${shots.length} captures, 0 page errors; ${output}`);
})().catch(async e => {
  console.error(e);
  if (browser) await browser.close().catch(() => {});
  if (galleryServer) galleryServer.close();
  process.exitCode = 1;
});
