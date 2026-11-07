# Relatório de dados — Campus Conectado

Registro da entrega inicial do Worker A, anterior ao build final. Para o estado
atual do APK, consulte `APK_BUILD.md` e `VALIDATION.md`.

Worker A (OpenCode). Contrato v1 preservado em `src/features/tasks/types.ts`;
nenhuma tela, token, tipo público, `package.json` ou lock foi alterado.

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `src/features/tasks/index.tsx` | `TasksProvider`, `useTasks`, `validateTaskInput`; repositório único e hidratação inicial |
| `src/features/tasks/validation.ts` | Normalização e validação por campo |
| `src/features/tasks/date.ts` | Datas civis `YYYY-MM-DD` sem conversão UTC |
| `src/features/tasks/seed.ts` | 11 atividades de demonstração relativas ao primeiro acesso |
| `src/features/tasks/persistedTasks.ts` | Chave, envelope versionado, encode/decode estrito |
| `src/features/tasks/repository.ts` | CRUD, fila serial de mutações, hidratação, erros e retry |
| `src/features/tasks/storage.ts` | Adapter nativo `expo-sqlite/kv-store` |
| `src/features/tasks/storage.web.ts` | Adapter web `localStorage` com o mesmo contrato |
| `src/features/tasks/errors.ts` | Erros tipados para validação, id inexistente, leitura/escrita e reset |
| `tests/tsconfig.build.json` | Compilação isolada dos módulos puros para Node |
| `tests/*.test.cjs` | 29 testes com `node:test`, sem framework adicional |
| `tests/support/in-memory-store.cjs` | Storage injetável com falhas e atrasos artificiais |
| `eas.json` | Perfil `preview` internal/APK e `production` AAB |
| `scripts/build-android-apk.ps1` | Caminho local gratuito, com checagem de JDK/SDK |
| `docs/APK_BUILD.md` | Requisitos, comandos e limites reais do build |

## Persistência e contrato

- Chave única: `campus-conectado/tasks/v1`.
- Formato: `{"version":1,"tasks":[...]}` serializado com `expo-sqlite/kv-store`.
- `null` na chave dispara seed; `{"version":1,"tasks":[]}` é estado válido e não
  sofre nova seed.
- JSON inválido, versão desconhecida, campo ausente, data impossível, status não
  booleano, `createdAt` fora de ISO ou id repetido rejeitam a hidratação inteira.
  Nada é corrigido, apagado ou sobrescrito automaticamente.
- Falha de leitura não vira seed. O hook expõe `error` e `retryHydration()`;
  mutações ficam bloqueadas até uma hidratação bem-sucedida.
- `resetDemo()` rejeita quando `__DEV__` não é verdadeiro. Em desenvolvimento ele
  é a única ação explícita que substitui dados, inclusive corrompidos.

### Concorrência

Toda operação passa por uma fila de promises no `TaskRepository`. Cada mutação
calcula o próximo array a partir do último estado confirmado, persiste e só então
publica estado + notificação. Escritas simultâneas não leem snapshots defasados e
uma falha de escrita não altera memória nem storage. O app usa um repositório
singleton, portanto não há duas filas disputando a mesma chave.

### Validação e datas

- Título, disciplina e prazo obrigatórios; descrição opcional.
- Títulos/disciplinas/descrições têm espaços externos removidos; quebras internas
  são preservadas.
- `dueAt` precisa ser data real do calendário (`2024-02-29` válido,
  `2026-02-29` e `2026-04-31` inválidos), sempre formatada por campos locais.
- `updateTask` valida o resultado completo, não apenas o patch.
- IDs inexistentes rejeitam sem criar atividade.
- Erros de validação incluem `fieldErrors` para a UI.

### Seed

11 tarefas em Estruturas de Dados, Banco de Dados, Engenharia de Software,
Cálculo, Redes de Computadores e Desenvolvimento Mobile. Há prazos vencido, hoje,
amanhã, +3, +7 e +10 dias, com mistura de concluídas e pendentes. Os prazos são
calculados no primeiro acesso; `createdAt` é timestamp ISO.

## Uso resumido para o README

```tsx
const {
  tasks, isHydrated, error, retryHydration,
  addTask, updateTask, deleteTask, toggleTask, resetDemo,
} = useTasks();
```

- Enquanto `!isHydrated`, mostre carregamento.
- Se `error`, mostre a mensagem e um botão que chame `retryHydration()`.
- `addTask`, `updateTask`, `deleteTask` e `toggleTask` retornam promises: aguarde
  antes de anunciar sucesso; em rejeição, preserve o formulário.
- `resetDemo()` só funciona em desenvolvimento; não exponha em produção.
- `validateTaskInput(input)` retorna `{}` quando válido e mensagens por campo
  (`title`, `discipline`, `description`, `dueAt`).

## Comandos e saídas reais

Instalação usada (sem scripts de ciclo de vida):

```text
> npm install --ignore-scripts --no-audit --no-fund
added 540 packages in 12s
```

TypeScript do app:

```text
> npx tsc --noEmit
(sem saída; código de saída 0)
```

Compilação dos testes puros:

```text
> npx tsc -p tests/tsconfig.build.json
(sem saída; código de saída 0)
```

Testes:

```text
> node --test "tests/*.test.cjs"
ℹ tests 29
ℹ suites 0
ℹ pass 29
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 505.0205
```

Cobertura dos testes: seed/calendário, validação e normalização, round-trip do
envelope, payload corrompido, versão desconhecida, id duplicado, campo ausente,
data impossível, seed idempotente, reabertura, array vazio, falha de leitura, falha
de escrita, retry, hidratação tardia, CRUD completo, alternância, id inexistente,
reset fora de desenvolvimento, reset em desenvolvimento, concorrência
(24 criações simultâneas + três mutações concorrentes na mesma tarefa) e adapter web
(`get/set` + ausência de `localStorage`).

## Verificação web e storage por plataforma

O import direto de `expo-sqlite/kv-store` no bundle web puxava o worker/WASM e
falhava sem configuração de Metro. Para não depender de WASM nem de headers
COOP/COEP no navegador, o storage foi isolado por plataforma, sem mudar a API
pública nem os testes do repositório:

| Plataforma | Arquivo resolvido | Storage |
| --- | --- | --- |
| Android/iOS | `src/features/tasks/storage.ts` | `expo-sqlite/kv-store` |
| Web | `src/features/tasks/storage.web.ts` | `localStorage` assíncrono atrás da mesma interface `KeyValueStore` |

`src/features/tasks/index.tsx` importa apenas `./storage`; o Metro escolhe o
arquivo `.web.ts` no navegador. O APK standalone continua usando SQLite. O
`localStorage` é local ao perfil do navegador e tem o mesmo comportamento de
persistência entre recargas.

Evidência real, sem `metro.config.js`:

```text
> npx expo export --platform web --output-dir dist/web-build-check
Starting Metro Bundler
Web Bundled 701ms node_modules/expo-router/entry.js (1281 modules)
› web bundles (3):
_expo/static/js/web/_layout-498edeb6...js (1MB)
_expo/static/js/web/entry-ba5ddfef...js (1.1MB)
Exported: dist/web-build-check
```

```text
> rg -l "ExpoSQLiteStorage|wa-sqlite|expo-sqlite" dist/web-build-check
No expo-sqlite references in web output
```

Assim, o web deixa de exigir `assetExts.push('wasm')`, worker e headers
`Cross-Origin-Embedder-Policy`/`Cross-Origin-Opener-Policy`. Se o projeto voltar a
usar SQLite no web, a receita oficial é adicionar `wasm` aos assets do Metro e
servir COOP/COEP; ambos foram testados em bundle e documentados como alternativa,
não como requisito atual.

A exportação web foi feita sem navegador real. O adapter web tem dois testes
Node (`get/set` e ausência de `localStorage`); a hidratação/persistência no
navegador ainda precisa de validação visual do coordenador.

## Preparação de APK

`eas.json` pronto com `preview` (`distribution: internal`, `buildType: apk`) e
`production` (AAB). O script local e o guia estão em `docs/APK_BUILD.md`.
Diagnóstico real do ambiente: `java`, `adb`, `gradle` e `eas` ausentes do PATH;
`ANDROID_HOME`/`ANDROID_SDK_ROOT` vazios; Android Studio e SDK padrão ausentes.
Nenhum APK foi gerado, nenhum build em nuvem foi disparado e nenhuma credencial
foi criada. EAS exige login humano e keystore; o caminho local exige JDK 17,
Android SDK/NDK e vários GB livres.

O script `scripts/build-android-apk.ps1` usa o `java` de `JAVA_HOME` quando
definido e imprime `java -version`, `JAVA_HOME` e `gradlew -version` para provar
qual JVM o Gradle usou. Ele rejeita APK `*unsigned*`, roda
`apksigner verify --print-certs` e só copia para `dist/android/CampusConectado.apk`
se a assinatura passar. Sintaxe validada com o parser do PowerShell; o build não
foi executado por falta de JDK/SDK.

## Limitações honestas

- Não houve teste em Android, emulador, Expo Go ou navegador real.
- O hook React não tem teste de renderização; os testes cobrem os módulos puros e
  o repositório com storage injetável. Não foi adicionado framework pesado.
- O singleton do provider pressupõe um único `TasksProvider` e uma única instância
  do repositório; duas instâncias independentes não compartilham a fila em memória.
- O reset em desenvolvimento substitui dados corrompidos por decisão explícita do
  usuário; a hidratação automática nunca faz isso.
- A exportação web foi validada sem browser; o adaptador `localStorage` tem testes
  Node, mas persistência entre recargas reais ainda depende do teste do coordenador.
- Ícone, assinatura e instalação do APK dependem do coordenador/usuário.
