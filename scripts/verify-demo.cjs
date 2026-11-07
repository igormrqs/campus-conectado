/* Final integration checks. Uses an isolated browser profile, never user data. */
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const base = process.env.CAMPUS_URL || 'http://localhost:8081';
const output = path.resolve('docs/evidence');
const key = 'campus-conectado/tasks/v1';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'campus-demo-qa-'));
const results = [];
const runtimeErrors = [];
let context;
let page;

async function openBrowser() {
  context = await chromium.launchPersistentContext(profile, {
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    headless: true, viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1, isMobile: true, hasTouch: true,
  });
  page = context.pages()[0] || await context.newPage();
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.setDefaultTimeout(12000);
}

async function tasks() {
  return page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)).tasks, key);
}

async function check(name, action) {
  await action();
  results.push({ name, result: 'passed' });
  console.log(`PASS ${name}`);
}

async function capture(name) {
  await page.evaluate(() => document.fonts.ready);
  // Allow the finite entrance sequence to settle before taking evidence.
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: false });
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  await openBrowser();
  await page.goto(base, { waitUntil: 'networkidle' });

  await check('Seed inicial, marca e progresso', async () => {
    await expect(page.getByText('Seu semestre', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('4 de 11 atividades', { exact: true })).toBeVisible();
    assert.equal((await tasks()).length, 11);
    await capture('01-home');
  });

  await page.getByRole('button', { name: 'Ver todas', exact: true }).click();
  await check('Filtros e conclusão atualizam totais', async () => {
    await expect(page.getByRole('tab', { name: /Pendentes, 7 itens/ })).toBeVisible();
    await page.getByRole('tab', { name: /Concluídas/ }).click();
    await expect(page.getByRole('checkbox')).toHaveCount(4);
    await page.getByRole('tab', { name: /Pendentes/ }).click();
    await expect(page.getByRole('checkbox')).toHaveCount(7);
    await page.getByRole('checkbox').first().click();
    await expect(page.getByRole('tab', { name: /Concluídas, 5 itens/ })).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(6);
    assert.equal((await tasks()).filter(task => task.completed).length, 5);
    await capture('02-activities');
  });

  await page.getByRole('button', { name: 'Nova', exact: true }).click();
  await check('Validação obrigatória e data impossível', async () => {
    await page.getByRole('button', { name: 'Cadastrar atividade', exact: true }).click();
    await expect(page.getByText('Informe o título da atividade.', { exact: true })).toBeVisible();
    await expect(page.getByText('Informe a disciplina.', { exact: true })).toBeVisible();
    await page.getByLabel('Título da atividade', { exact: true }).fill('Apresentar Campus Conectado');
    await page.getByLabel('Disciplina', { exact: true }).fill('Desenvolvimento Mobile');
    await page.getByLabel('Prazo YYYY-MM-DD', { exact: true }).fill('2026-02-30');
    await page.getByRole('button', { name: 'Cadastrar atividade', exact: true }).click();
    await expect(page.getByText('Use uma data válida (AAAA-MM-DD).', { exact: true })).toBeVisible();
    assert.equal((await tasks()).length, 11);
  });

  let createdId;
  await check('Cadastro real com prazo amanhã e descrição longa', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    await page.getByLabel('Prazo YYYY-MM-DD', { exact: true }).fill(tomorrowISO);
    await page.getByLabel('Descrição da atividade', { exact: true }).fill('Demonstrar cadastro, edição, conclusão e persistência local. '.repeat(8));
    await capture('03-form');
    await page.getByRole('button', { name: 'Cadastrar atividade', exact: true }).click();
    await page.waitForURL('**/activities');
    const records = await tasks();
    assert.equal(records.length, 12);
    const created = records.find(task => task.title === 'Apresentar Campus Conectado');
    assert.ok(created);
    createdId = created.id;
    assert.equal(created.discipline, 'Desenvolvimento Mobile');
    assert.ok(created.description.length > 200);
  });

  await check('Edição e alteração de prazo', async () => {
    await page.getByRole('tab', { name: /Todas/ }).click();
    await page.getByRole('button', { name: 'Editar atividade Apresentar Campus Conectado', exact: true }).click();
    await expect(page.getByLabel('Título da atividade', { exact: true })).toHaveValue('Apresentar Campus Conectado');
    await page.getByLabel('Descrição da atividade', { exact: true }).fill('Demo revisada e pronta para apresentação.');
    await page.getByText('Em 3 dias', { exact: true }).click();
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await page.waitForURL('**/activities');
    const updated = (await tasks()).find(task => task.id === createdId);
    assert.equal(updated.description, 'Demo revisada e pronta para apresentação.');
  });

  await check('Exclusão cancelada e confirmada', async () => {
    const target = (await tasks()).find(task => task.id !== createdId && !task.completed);
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: `Excluir ${target.title}`, exact: true }).click();
    assert.equal((await tasks()).length, 12);
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: `Excluir ${target.title}`, exact: true }).click();
    await expect.poll(async () => (await tasks()).length).toBe(11);
    assert.ok((await tasks()).some(task => task.id === createdId));
  });

  await check('Persistência após fechar e reabrir processo do navegador', async () => {
    await context.close();
    await openBrowser();
    await page.goto(`${base}/activities`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('tab', { name: /Todas, 11 itens/ })).toBeVisible();
    const saved = (await tasks()).find(task => task.id === createdId);
    assert.equal(saved.description, 'Demo revisada e pronta para apresentação.');
  });

  await check('Abertura direta de edição e identificador inexistente', async () => {
    await page.goto(`${base}/task-form?id=${createdId}`, { waitUntil: 'networkidle' });
    await expect(page.getByLabel('Título da atividade', { exact: true })).toHaveValue('Apresentar Campus Conectado');
    await page.goto(`${base}/task-form?id=nao-existe`, { waitUntil: 'networkidle' });
    await expect(page.getByText('Atividade inexistente', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar alterações', exact: true })).toHaveCount(0);
  });

  const savedRaw = await page.evaluate(storageKey => localStorage.getItem(storageKey), key);
  await check('Estado vazio persistido sem recriar seed', async () => {
    await page.evaluate(storageKey => localStorage.setItem(storageKey, JSON.stringify({ version: 1, tasks: [] })), key);
    await page.goto(`${base}/activities`, { waitUntil: 'networkidle' });
    await expect(page.getByText('Nenhuma atividade encontrada', { exact: true })).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal((await tasks()).length, 0);
    await capture('04-empty');
  });

  await check('JSON corrompido preservado e retry recupera após reparo', async () => {
    await page.evaluate(storageKey => localStorage.setItem(storageKey, '{corrompido'), key);
    await page.goto(`${base}/activities`, { waitUntil: 'networkidle' });
    await expect(page.getByText(/corrompidos e não foram alterados/)).toBeVisible();
    await expect(page.getByText('Nenhuma atividade encontrada', { exact: true })).toHaveCount(0);
    assert.equal(await page.evaluate(storageKey => localStorage.getItem(storageKey), key), '{corrompido');
    await capture('05-storage-error');
    await page.evaluate(({ storageKey, raw }) => localStorage.setItem(storageKey, raw), { storageKey: key, raw: savedRaw });
    await page.getByRole('button', { name: /Tentar/ }).click();
    await expect(page.getByRole('tab', { name: /Todas, 11 itens/ })).toBeVisible();
  });

  await check('Larguras 360 e 1280 e preferência reduced motion', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(`${base}/task-form`, { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await capture('06-form-360');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base, { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'Nova', exact: true }).first()).toBeVisible();
    await capture('07-home-wide');
  });

  assert.deepEqual(runtimeErrors, [], 'Browser runtime/console errors');
  fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({
    date: new Date().toISOString(), browser: process.env.PLAYWRIGHT_CHANNEL || 'chromium',
    platform: 'web', results, runtimeErrors,
    limitations: 'Não verifica execução Android, APK, teclado nativo, TalkBack, haptics ou desempenho.',
  }, null, 2));
  await context.close();
  console.log(`PASS ${results.length} checks; evidence in ${output}`);
})().catch(async error => {
  console.error(error);
  if (page && !page.isClosed()) await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
  fs.writeFileSync(path.join(output, 'browser-failure.json'), JSON.stringify({ error: String(error), results, runtimeErrors }, null, 2));
  if (context) await context.close();
  process.exitCode = 1;
});
