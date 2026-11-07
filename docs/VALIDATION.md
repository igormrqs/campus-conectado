# Validação da integração

Este registro distingue verificações de código, navegador e aparelho. Uma
exportação JavaScript Android não é um APK nem comprova execução no Android.

## Ambiente

- Expo SDK 58, Windows, Node 24.21.0; configuração em ENVIRONMENT.md.
- Metro iniciou com `npx expo start --web --port 8081`.
- Execução real no Microsoft Edge headless via Playwright, perfil isolado em
  diretório temporário. Viewports 412 × 915, 360 × 800 e 1280 × 900 CSS px.
  É teste web, não emulação do sistema Android.
- Nenhum dispositivo/emulador Android anexado; Java/Android SDK ausentes nos
  caminhos padrão e no PATH. EAS inicial: `Not logged in`.

## Evidências e estado

1. Contrato e tokens congelados antes dos workers: commit 5329700.
2. TypeScript do aplicativo integrado: `npx tsc --noEmit` passou.
3. `npx expo install --check`: dependências compatíveis.
4. Dados: 29 testes passaram (compilação com `npx tsc -p tests/tsconfig.build.json`
   e `node --test tests/*.test.cjs`), cobrindo calendário/seed/CRUD, corrupção,
   falhas de leitura/escrita, retry, reabertura, reset DEV e concorrência.
5. `PLAYWRIGHT_CHANNEL=msedge npm run test:e2e`: 11 verificações passaram,
   sem `pageerror` ou erros de console. Relatório: `evidence/browser-results.json`.
   Capturas reais em `evidence/01-home.png` até `07-home-wide.png`.
   A suíte fecha o processo do navegador e reabre o mesmo perfil para conferir
   persistência. Testa criação, edição, conclusão, filtros, exclusão cancelada e
   confirmada, campos vazios/data impossível, descrição longa, ID inexistente,
   estado vazio persistido, corrupção sem sobrescrita e retry após reparo.
6. Bundle Android: `npx expo export --platform android --output-dir dist/android-bundle-final`
   passou; 1818 módulos, bytecode Hermes e assets locais incluídos. Este resultado
   NÃO é um APK. `eas.json` preview internal/APK e ícone 1024×1024 configurados.
   O build local inicialmente parou por falta de Java. Após login do usuário,
   EAS concluiu o build `17fa2dc9-4d6e-426d-96b5-7e25f5f9e4fe` no perfil preview.
   APK real em `artifacts/CampusConectado.apk`, 102.270.223 bytes; assinatura v2
   verificada pelo apksigner. AAPT confirmou pacote, nome, versão 1.0.0 (1),
   min SDK 24, target 36 e quatro ABIs, sem debuggable. Bundle, fontes, seed e
   SQLite estão incorporados. Ver `evidence/apk-verification.json` e outputs
   `apk-signature.txt` / `apk-badging.txt`. Não houve teste de instalação Android.

## Revisão e ajustes

- Workers OpenCode e Antigravity em duas worktrees isoladas; integração via
  cherry-pick sem alterações unilaterais de contrato/tokens.
- Corrigidos controles aninhados, captura de rejeições/haptics, confirmação e data
  na web, abertura direta do formulário, ordem de hooks, largura central e CTA.
- Uma rodada de refinamento visual guiada por capturas; correção funcional final
  separa erro de armazenamento de caderno vazio.
- A preferência `reduced-motion` foi exercitada no navegador. Isso não comprova
  suavidade, timing háptico ou desempenho em aparelho.

## Entrega do APK

O bloqueio de autenticação foi resolvido pelo usuário. O EAS gerou a keystore
remota e compilou o APK; consulta de uso confirmou plano Free, um build Android
consumido e custo adicional estimado de zero. Nenhuma loja recebeu publicação.

SHA-256: `3c88675355634760756ff053647dc861d75ab66eca20fffccf92bf2b3cdd9ce8`.
[Download](https://expo.dev/artifacts/eas/T61Y6cOqc-xKsdsVOnkqWaqcB8OwSKVENcbh7urxQzM.apk)
com retenção prevista até 21/11/2026; cópia local preservada em `artifacts/`.

O ADB portátil foi executado após o build e não encontrou dispositivos. A
assinatura e estrutura verificadas não substituem execução real no Android.

Não foram testados em aparelho: instalação, teclado Android, haptics, TalkBack,
retomada por processo nativo, redução de movimento nativa e desempenho.
