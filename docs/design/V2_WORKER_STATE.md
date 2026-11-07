# Codex worker — V2 estados, calendário e invariantes

Melhore o Campus Conectado existente. Leia AGENTS.md e docs/design/{
PROMPT_COORDINATOR_REDESIGN,DIRECAO_DE_ARTE,V2_CONTRACTS}.md; o briefing V2
prevalece nos conflitos de papéis/visual. Este é trabalho funcional, não UI.

Ownership EXCLUSIVO definido em V2_CONTRACTS. Não editar app/**, componentes,
tokens, package/lock ou scripts. Sem subagentes, pagamentos, cloud build ou
comandos destrutivos. Não apagar/resetar dados do usuário. Trabalhe neste
worktree isolado, a partir do contrato congelado. Preserve persistência/API V1.

Implemente seletores e useTaskToday exatamente conforme contrato, exportando pelo
index de tasks; normalize datas civis com validação real e pt-BR sem UTC. Complete
os helpers de date-utils mantendo compatibilidade. Elimine referência ISO nas
mensagens visíveis de validação. Datas 0001–0099 devem ser tratadas corretamente,
sem o deslocamento implícito do construtor Date. Evite lógica duplicada em UI.

Crie testes significativos de foco somente pendente, prioridade, 100% concluído,
zero itens, contadores, disciplina/status combinados, datas inválidas/bissextos,
pt-BR ida/volta e imutabilidade do input. Não reescrever repositório funcional.
Teste hidratação/CRUD existentes com npm test; npx tsc --noEmit deve passar.
Adapte tests/tsconfig.build.json para compilar módulos puros de date-utils sem
incluir adapters nativos nem React hooks. Não fingir teste AppState/aparelho.

Use npm ci --ignore-scripts neste checkout se necessário. Relatório em
docs/design-v2/STATE_REPORT.md com arquivos, testes reais, limites e hashes dos
commits. Faça commit apenas do escopo e reporte worker_done com resultado real.
Os stubs iniciais são contrato; substitua-os por implementação completa.
