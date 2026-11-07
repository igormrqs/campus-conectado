# Task A — OpenCode

Construa a camada de dados do MVP Campus Conectado neste worktree isolado.
Leia integralmente AGENTS.md e docs/, em especial CONTRACTS.md e DEMO_SCENARIO.md.
Execute somente o papel Worker A do EXECUTION_PLAN. Consulte skills instaladas
quando pertinentes. Não iniciar agentes, não usar APIs/modelos/serviços pagos,
não configurar bypass. Ações arriscadas exigem aprovação manual do usuário.

Contrato e tokens já congelados. Substitua skeleton de src/features/tasks/index.tsx
com implementação real sem alterar exports/assinaturas. Ownership em CONTRACTS.md.
Persistência expo-sqlite/kv-store; dados relativos ao primeiro acesso, seed
idempotente de 10–12 tarefas, CRUD, validação calendário, hidratação, erros e
retry. Escritas concorrentes não podem perder atualizações. Não sobrescrever
dados corrompidos ou transformar erro de leitura em nova seed. Array vazio é válido.
resetDemo somente em desenvolvimento. Não editar telas, tokens, tipos públicos,
package.json ou lock; solicite ao coordenador dependências ausentes.

Crie testes significativos de CRUD/persistência/validação/falhas, com storage
injetável se necessário e sem framework pesado. Prepare docs/DATA_REPORT.md
com arquivos, comandos e saídas reais, limitações e resumo de uso para README.
Use npm install --ignore-scripts neste worktree se preciso. Rode npx tsc --noEmit
e testes disponíveis. Saída não zero não resolvida significa falha da Task.
Faça commit apenas dos próprios arquivos; informe hash ao coordenador e worker_done.
Não declarar teste em aparelho sem execução real. Não mergear outras branches.
