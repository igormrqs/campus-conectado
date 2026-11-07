# Contratos congelados — v1

Fonte pública: `src/features/tasks/index.tsx`; tipos imutáveis em `types.ts`.
O hook tem a API de AGENTS.md mais `error: string | null` e `retryHydration()`
para permitir recuperação de falha local. `TasksProvider` envolve a navegação
uma única vez. Nenhuma tela mantém cópia independente das tarefas.

`dueAt` é data civil ISO `YYYY-MM-DD`, validada como data real. Nunca converter
essa data por `toISOString()` para exibição local. `createdAt` é timestamp ISO.
`validateTaskInput(input)` retorna erros por campo (`{}` quando válido).
Mutações rejeitam em erro; UI aguarda persistência antes de anunciar sucesso,
preserva formulário e exibe mensagem. Não ignorar erros de disco nem sobrescrever
JSON corrompido com seed. `resetDemo` deve rejeitar fora de `__DEV__`.

Seed somente quando a chave de armazenamento não existe; `[]` é estado válido.
Serializar mutações concorrentes para impedir perda de alterações. Atualização
parcial valida resultado completo. IDs inexistentes rejeitam sem criar tarefas.

## Pastas e ownership

- OpenCode: `src/features/tasks/**` exceto `types.ts`, `src/data/**`, `tests/**`,
  utilitários de dados, scripts próprios de teste; rascunho `docs/DATA_REPORT.md`.
- Antigravity: `app/**` exceto `_layout.tsx` raiz, `src/components/**`,
  `src/design/**` exceto `tokens.ts`, `docs/UI_REPORT.md` e
  `docs/ROOT_LAYOUT_REQUEST.md` com patch de fontes/navegação para integração.
- Codex: tipos públicos, tokens, `_layout.tsx` raiz, manifesto/lock/config,
  integração e README/relatório final. Workers pedem dependências ao coordenador.

Rotas: `/` início, `/activities` lista e `/task-form?id=<id>` edição ou sem id
para criação. UI define sua navegação dentro dessas três telas. Fonte única de
tokens: `src/design/tokens.ts`. Paleta fixa clara é decisão expressa do briefing.
Fontes devem ser carregadas localmente antes de renderizar; não buscar em runtime.

Consultar skills Expo e Vercel já instaladas. frontend-design é inspiração visual;
o app usa componentes nativos, StyleSheet e Reanimated. Não instalar serviços nem
modelos pagos. Não criar novos workers. Permissões manuais para ações arriscadas.

## Evidência exigida

Cada worker entrega commit, arquivos, comandos/saídas, limitações e relatório.
Não afirmar Android/aparelho/performance verificados sem execução real.
Falha de teste é falha da Task, exceto falta de aparelho relatada honestamente.
Nenhum worker altera contrato, tokens ou lock unilateralmente.
