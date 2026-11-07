# V2 — contratos e divisão de arquivos

O briefing em PROMPT_COORDINATOR_REDESIGN.md e DIRECAO_DE_ARTE.md prevalece
sobre instruções V1 conflitantes. Conceito: Agenda em Movimento. Baseline
de retorno: tag `baseline/campus-v1-before-redesign`, commit f06f40b.

## Dados e compatibilidade

Task, TaskInput, useTasks/TasksProvider e validateTaskInput preservam a API
V1. Não mudar a chave `campus-conectado/tasks/v1`, o envelope versionado, o
SQLite nativo, o adapter web ou a regra seed apenas na primeira abertura.
Atualizar o APK não pode resetar dados. Erros de leitura/escrita nunca devem
virar seed automática. __DEV__ continua sendo o limite do reset.

Rotas preservadas: `/`, `/activities`, `/task-form` e `/task-form?id=<id>`.

## Helpers compartilhados congelados antes dos workers

Exportados por `@/src/features/tasks` e implementados em `selectors.ts`:

```ts
type TaskFilter = 'all' | 'pending' | 'completed';
type TaskStats = {
  total: number; pending: number; completed: number;
  overdue: number; percentage: number;
};
getTaskStats(tasks: readonly Task[], today?: string): TaskStats;
selectFocusTasks(tasks: readonly Task[], today?: string, limit?: number): Task[];
selectFilteredTasks(tasks: readonly Task[], filter?: TaskFilter,
  discipline?: string | null, today?: string): Task[];
getTaskDisciplines(tasks: readonly Task[]): string[];
useTaskToday(): string; // data civil local, atualiza na meia-noite/retomada
```

- `today`: YYYY-MM-DD local, default hoje; sem UTC para datas civis.
- Foco: SOMENTE pendentes, vencidas primeiro, hoje depois, futuras em seguida;
  datas ascendentes, desempate estável por createdAt/id; limit default 3.
  Nenhuma pendente => [], nunca preencher com concluídas.
- Filtro: respeita status e disciplina sem case/espaços externos; não muta input.
  Pendentes antes das concluídas; pendentes por prazo ascendente, concluídas por
  prazo descendente. Estatísticas de filtro por disciplina usam o conjunto
  `selectFilteredTasks(tasks, 'all', discipline, today)`, antes do filtro de status.
- Percentual: arredondado do conjunto recebido; 0 itens => 0, sem NaN.
- Disciplinas: strings existentes, deduplicação case-insensitive, ordem pt-BR.

`src/design/date-utils.ts` preserva exports existentes e acrescenta:

```ts
formatDatePtBR(iso: string, style?: 'short' | 'long'): string;
formatDateInput(iso: string): string; // DD/MM/AAAA
parseDateInput(text: string): string | null; // entrada DD/MM/AAAA -> ISO válido
getDateBlock(iso: string): { day: string; month: string; year: string };
```

`short`: "07 nov 2026"; `long`: "7 de novembro de 2026".
Datas inválidas nunca devem ser normalizadas para outro dia. Não mostrar ISO na
UI ou nas mensagens; o ISO permanece apenas no armazenamento. Web pode usar
um único campo editável DD/MM/AAAA e erro inline. Android mantém DateTimePicker
existente com uma única apresentação localizada. Não inventar um picker sem ação.

## Tokens e componentes

Paleta e famílias preservadas. Tokens mantêm todos os nomes V1, com escala
compacta, `spacing.smd=12`, `spacing.mdl=20`, headline 17, section 22 e hero 34.
Acrescentar `colors.error` escuro para texto e tintas semânticas com contraste.
Coral base fica para ícone/borda; textos comuns >=4,5:1, grandes >=3:1.
Alvos preferencialmente 48dp. Antigravity pode ajustar tokens dentro da direção,
preservando os exports compartilhados; Codex funcional não toca em tokens.

TaskCard pode evoluir para linha editorial e aceitar `compact`/`variant`,
preservando props `task`, `onToggle`, `onPress`, `onDelete`, `index` quando úteis.
Filtros mantêm tipo 'all'/'pending'/'completed'. Sem botões dentro de botões.
Manter labels de acessibilidade para testes e descoberta:

- Título da atividade; Disciplina; Descrição da atividade; Prazo da atividade.
- Editar atividade <título>; Marcar como concluída / Marcar como pendente.
- Tabs Todas / Pendentes / Concluídas com contagem no accessibilityLabel.
- Salvar alterações / Cadastrar atividade; Excluir atividade; Voltar.

## Ownership exclusivo

| Responsável | Arquivos |
|---|---|
| Codex funcional | src/features/tasks/** (exceto types.ts), src/design/date-utils.ts, tests/**, docs/design-v2/STATE_REPORT.md |
| Antigravity visual | app/** exceto app/_layout.tsx, src/components/**, src/design/** exceto date-utils.ts, docs/design-v2/UI_REPORT.md, docs/design-v2/ROOT_REQUEST.md, docs/design-v2/worker-ui/** |
| Coordinator | app/_layout.tsx, types.ts, package/lock/config, scripts/**, documentação final, capturas de integração, APK |

Não tocar em arquivos alheios. Antigravity organiza layout/navegação VISÍVEL
dentro das rotas existentes; Codex funcional fornece seletores/data e invariantes.
Coordinator integra providers e dependências caso necessário. Sem novos pacotes
por iniciativa do worker. Preferir dependências já instaladas; fonte única local.

## Entrega por fatias, sem refação do app

1. Início + foco e contadores; 2. lista/filtros/linhas; 3. formulário e datas;
4. vazio/erro; 5. comparação 360x800, 390x844 e 1280x900.
UI usa callbacks reais, await/catch e preserva rascunho se falhar.
Salvar em rodapé fora do ScrollView, respeitando insets e teclado/adjustResize.
Android real não está acessível inicialmente; capturas web não provam IME/haptics.

Cada worker entrega commits pequenos, arquivos, comandos, resultados e limites.
Não iniciar subagentes, EAS builds ou serviços pagos. Até dois workers simultâneos.
OpenCode não participa: não há tarefa trivial que justifique recrutamento.
