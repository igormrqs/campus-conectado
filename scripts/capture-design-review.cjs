// Read-only design evidence; all data changes use a fresh, isolated browser context.
const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const output = path.resolve(process.env.REVIEW_OUTPUT || 'docs/design-review/2026-11-07-atual');
const base = process.env.CAMPUS_URL || 'http://localhost:8081';
const records = [];
const key = 'campus-conectado/tasks/v1';
let browser;

(async () => {
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  async function top() {
    await page.evaluate(() => document.querySelectorAll('*').forEach(el => { if (el.scrollHeight > el.clientHeight) el.scrollTop = 0; }));
  }
  async function capture(file, title, note) {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(output, `${file}.png`) });
    records.push({ file: `${file}.png`, title, note, viewport: page.viewportSize(), route: new URL(page.url()).pathname });
  }
  await page.goto(base, { waitUntil: 'networkidle' });
  await expect(page.getByText('4 de 11 atividades', { exact: true })).toBeVisible();
  const initial = await page.evaluate(storageKey => localStorage.getItem(storageKey), key);
  await capture('01-inicio-412', 'Início — primeira dobra', '412 × 915. Seed original, quatro concluídas e uma atrasada.');
  const devReset = page.getByRole('button', { name: 'Restaurar dados da demo', exact: true });
  if (await devReset.count()) await devReset.scrollIntoViewIfNeeded();
  else await page.getByRole('button', { name: 'Ver todas as atividades', exact: true }).scrollIntoViewIfNeeded();
  await capture('02-inicio-rodape-412', 'Início — rodapé', 'O botão Restaurar dados da demo é exclusivo do desenvolvimento e não aparece no APK release.');

  await page.goto(`${base}/activities`, { waitUntil: 'networkidle' });
  await capture('03-atividades-todas-412', 'Atividades — todas', 'Onze atividades; filtros por status e disciplinas.');
  await page.getByRole('tab', { name: /Pendentes/ }).click();
  await capture('04-atividades-pendentes-412', 'Atividades — pendentes', 'Sete pendentes, incluindo atividade atrasada.');
  await page.getByRole('tab', { name: /Concluídas/ }).click();
  await capture('05-atividades-concluidas-412', 'Atividades — concluídas', 'Quatro concluídas; verificar legibilidade dos cartões atenuados.');

  await page.goto(`${base}/task-form`, { waitUntil: 'networkidle' });
  await expect(page.getByLabel('Título da atividade', { exact: true })).toBeVisible();
  await capture('06-criar-topo-412', 'Criar — parte superior', 'Na web há campo ISO para data; o APK usa seletor Android e botão Outra data.');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).scrollIntoViewIfNeeded();
  await capture('07-criar-rodape-412', 'Criar — ações e descrição', 'Ação principal no fluxo de rolagem. Teclado Android não representado.');
  await page.getByRole('button', { name: 'Cadastrar atividade', exact: true }).click();
  await top();
  await capture('08-criar-validacao-412', 'Criar — validação inline', 'Campos obrigatórios vazios; sem criação de atividade.');

  await page.goto(`${base}/task-form?id=seed-02`, { waitUntil: 'networkidle' });
  await expect(page.getByLabel('Título da atividade', { exact: true })).not.toHaveValue('');
  await capture('09-editar-412', 'Editar — tarefa existente', 'Mesma experiência de formulário, com conteúdo real da seed e ação de excluir.');

  await page.evaluate(storageKey => localStorage.setItem(storageKey, JSON.stringify({ version: 1, tasks: [] })), key);
  await page.goto(`${base}/activities`, { waitUntil: 'networkidle' });
  await expect(page.getByText('Nenhuma atividade encontrada', { exact: true })).toBeVisible();
  await capture('10-lista-vazia-412', 'Atividades — estado vazio', 'Dados vazios apenas no perfil isolado desta captura.');

  await page.evaluate(({ storageKey, raw }) => {
    const data = JSON.parse(raw); data.tasks.forEach(task => task.completed = true);
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, { storageKey: key, raw: initial });
  await page.goto(base, { waitUntil: 'networkidle' });
  await expect(page.getByText('11 de 11 atividades', { exact: true })).toBeVisible();
  await capture('11-tudo-concluido-412', 'Início — tudo concluído', 'O radar continua exibindo duas atividades concluídas; estado importante para revisão de copy.');

  await page.evaluate(storageKey => localStorage.setItem(storageKey, '{corrompido'), key);
  await page.goto(`${base}/activities`, { waitUntil: 'networkidle' });
  await expect(page.getByText(/corrompidos e não foram alterados/)).toBeVisible();
  await capture('12-erro-armazenamento-412', 'Atividades — erro de armazenamento', 'Mensagem preserva dados e oferece tentar novamente.');

  await page.evaluate(({ storageKey, raw }) => localStorage.setItem(storageKey, raw), { storageKey: key, raw: initial });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await capture('13-inicio-360', 'Início — celular menor', '360 × 800 para avaliar espaço ocupado antes das tarefas.');
  await page.goto(`${base}/task-form`, { waitUntil: 'networkidle' });
  await capture('14-criar-360', 'Criar — celular menor', 'Quantidade de sugestões antes do prazo e da ação principal.');

  const manifest = {
    capturedAt: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    source: 'React Native Web / Expo development server, Microsoft Edge headless',
    nativeApkScreenshots: false, userDeviceAvailable: false,
    limitations: ['Sem captura do APK ou teclado Android', 'Data na web usa TextInput; APK usa DateTimePicker nativo', 'Rodapé de desenvolvimento difere do APK', 'Imagens estáticas não avaliam motion/haptics', 'Dados e erros simulados apenas em contexto isolado'],
    runtimeErrors: errors, screenshots: records,
  };
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(output, 'index.html'), `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Campus Conectado — capturas atuais</title><style>body{font:16px system-ui;margin:32px;background:#f4f4f4;color:#171a21}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:28px}article{max-width:412px}img{width:100%;height:auto;border:1px solid #ccc}p{line-height:1.5;max-width:900px}a{color:#314bce}</style><h1>Campus Conectado — design atual</h1><p>Capturas web do código atual, em tamanhos de celular. Não são prints do APK Android. Nenhuma alteração visual foi aplicada. Abra uma imagem para vê-la no tamanho original e use seu número ao enviar diretrizes.</p><p><a href="REVISAO.md">Revisão e prioridades</a> · <a href="manifest.json">Origem e limitações</a></p><main>${records.map(r => `<article><h2>${r.title}</h2><p>${r.file} — ${r.note}</p><a href="${r.file}"><img loading="lazy" src="${r.file}" alt="${r.title}"></a></article>`).join('')}</main></html>`);
  await context.close();
  await browser.close();
  console.log(JSON.stringify({ output, screenshots: records.length, runtimeErrors: errors }, null, 2));
})().catch(async error => { console.error(error); if (browser) await browser.close().catch(() => {}); process.exitCode = 1; });
