# V2 — estados, calendário e invariantes

Implementado pelo Codex funcional no worktree isolado `campus-v2-state`, conforme ownership congelado em V2_CONTRACTS. Nenhum arquivo de UI, tokens, tipos públicos, package/lock ou scripts foi alterado.

## Commits de referência

- Baseline V1: `f06f40b633c24bb5368afd5c645bacf3633c4bea`.
- Contrato V2 recebido: `2ade43723d5ae4a60f6afd16ab7a9802d3b9aae9`.
- Implementação e testes: `8177686a76a15dd53c7490e55adbb993a0d3467d`.
- Este relatório é entregue em commit de documentação separado; seu hash consta no histórico Git posterior ao commit de implementação.

## Arquivos e comportamento

- `src/features/tasks/selectors.ts`: implementa foco exclusivamente pendente (limite padrão 3), ordenação por prazo/createdAt/id, filtros combinados por disciplina e status, contadores e percentual arredondado, disciplinas deduplicadas sem case/espaços externos e ordenadas em pt-BR. Todas as seleções criam arrays sem modificar tarefas recebidas. Datas ascendentes já agrupam vencidas, hoje e futuras; não é necessário duplicar classificação de urgência na UI.
- `src/features/tasks/use-task-today.tsx`: estado da data civil local com timer recalculado até a próxima meia-noite, atualização na retomada `AppState.active`, cancelamento de timer e remoção de subscription no cleanup.
- `src/features/tasks/date.ts`: formatação local com ano de quatro dígitos, inclusive 0001–0099. O validador gregoriano existente passa a ser a única regra de validade usada pelos helpers de apresentação.
- `src/design/date-utils.ts`: completa formatDatePtBR, formatDateInput, parseDateInput e getDateBlock; preserva exports anteriores. Rejeita dias inexistentes, mantém ida/volta DD/MM/AAAA e usa setFullYear para impedir deslocamento de anos pequenos. Datas inválidas não viram outro dia: parser retorna null, campo retorna vazio, texto retorna Data inválida e bloco retorna travessões. Aritmética inválida ou fora de 0001–9999 mantém a entrada. Nenhuma conversão UTC é usada para datas civis.
- `src/features/tasks/validation.ts`: mensagem de data inválida legível, sem referência ao formato ISO de armazenamento.
- `tests/selectors.test.cjs`: seis testes de foco/prioridade/desempate, atualização após conclusão, 100% concluído, zero itens, contadores, disciplina/status, ordenação e input congelado.
- `tests/date-utils.test.cjs`: cinco testes de datas inválidas/bissextos, ida/volta pt-BR, anos pequenos, limites e aritmética, mensagens de validação e compatibilidade dos helpers relativos.
- `tests/tsconfig.build.json`: inclui date-utils no build puro. Lista de módulos verificada com `--listFilesOnly`: não inclui storage nativo, hooks React ou index/provider; adapter web puro permanece para os testes V1 existentes.

Os exports públicos de seletores/tipos e useTaskToday já estavam em `src/features/tasks/index.tsx` e foram preservados. A UI deve usar esse index e os helpers compartilhados. Contadores por disciplina devem receber `selectFilteredTasks(tasks, 'all', discipline, today)` antes de aplicar o filtro de status.

## Verificação real

Executada em 07/11/2026 neste checkout:

- `npm ci --ignore-scripts`: sucesso; nenhum package/lock alterado.
- `npm test`: **40 testes, 40 aprovados, zero falhas**. Inclui testes V1 reais do repositório com store em memória: hidratação/seed uma única vez, reabertura, coleção vazia, dados corrompidos preservados, falhas de leitura/escrita, CRUD, serialização de alterações concorrentes, recuperação explícita e proteção de reset fora de desenvolvimento.
- `npx tsc --noEmit`: sucesso, zero erros.
- `$env:TZ='Pacific/Kiritimati'; node --test tests/date-utils.test.cjs`: 5/5 aprovados.
- `$env:TZ='America/New_York'; node --test tests/date-utils.test.cjs`: 5/5 aprovados.
- `npx tsc -p tests/tsconfig.build.json --listFilesOnly`: conferida separação de módulos puros e código nativo/hooks.
- `git diff --check`: sucesso.

## Limites e integração

Não foram executados testes em aparelho/emulador, AppState real, passagem de meia-noite em runtime React Native, date picker, teclado, haptics, screenshots ou APK. useTaskToday foi implementado e validado por TypeScript/revisão do cleanup e agendamento; isso não representa teste de lifecycle em dispositivo. Esses checks e a substituição da lógica duplicada nas telas pertencem à integração/QA do coordenador e à ownership visual.

O repositório funcional, chave `campus-conectado/tasks/v1`, envelope, adapters e API useTasks não foram reescritos. Os testes de CRUD/hidratação usam store em memória e os de adapter web usam storage simulado; não provam SQLite nativo em aparelho. Nenhum dado real do usuário foi apagado, resetado ou migrado.
