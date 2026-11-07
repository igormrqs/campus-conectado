# Orca — primeira execução

Estas instruções se referem ao Orca de **onorca.dev / github.com/stablyai/orca**, não ao projeto diferente `orca-cli/orca`.

1. Instale uma versão estável pela página oficial https://www.onorca.dev/download.
2. Faça login nos CLIs/ambientes Codex, OpenCode e Antigravity que você já possui. No Orca, verifique Settings → Agents para descobrir cada integração; teste cada agente isoladamente antes da orquestração.
3. Em Settings → Agents → Agent Permissions, configure **Manual** no início. A documentação informa que novas sessões CLI podem usar bypass de permissões por padrão; não confie apenas no isolamento de worktrees para proteger arquivos fora do repo.
4. Crie projeto Expo. Confirme que está num repositório Git com commit inicial (`git status` e `git log -1`). Copie este kit para a raiz.
5. No Orca, Add Repo → selecione o repositório. Abra um worktree/coordenador com Codex.
6. Instale skills oficiais apropriadas via `npx skills add` para os agentes selecionados, após revisar o SKILL.md de cada repo.
7. Leia `orca skills get orchestration --full` — o comando mostra a orientação compatível com a versão em execução. Verifique `orca status --json`.
8. A orquestração estruturada é experimental. Algumas versões podem não mostrar painel/alternância no Settings → Experimental; o fluxo por CLI e os comandos disponíveis devem ser conferidos no runtime. Se indisponível, crie duas worktrees pela interface e distribua os prompts manualmente.

## Exemplos de comandos da orquestração
No terminal associado ao coordenador, se suportado por sua versão:
```
orca status --json
orca skills get orchestration --full
orca orchestration run-create --objective "MVP Campus Conectado: funcional e visualmente marcante" --json
orca orchestration task-create --task-title "CRUD e dados locais" --spec "Leia AGENTS.md, docs/EXECUTION_PLAN.md e docs/DEMO_SCENARIO.md. Execute somente Worker A/OpenCode; não altere telas." --json
orca orchestration task-create --task-title "UI editorial e motion" --spec "Leia AGENTS.md, docs/DESIGN_DIRECTION.md e docs/EXECUTION_PLAN.md. Execute somente Worker B/Antigravity; não altere armazenamento." --json
```
Copie IDs reais impressos nos recibos e substitua `<taskId-A>`/`<taskId-B>`:
```
orca orchestration worker-start --task <taskId-A> --worktree new-child --name data-opencode --agent opencode --setup run --json
orca orchestration worker-start --task <taskId-B> --worktree new-child --name ui-antigravity --agent antigravity --setup run --json
```
A documentação oficial traz mais modos de disparo, verificação e recuperação. Não execute uma mistura de comandos antigos `orca orchestration run` ou `coordinator-start`, hoje aposentados.

## Alternativa visual sem CLI experimental
Na sidebar do Orca, Add Repo → `+` → criar duas worktrees com agentes distintos. Cole as seções de Worker A e B do plano, cada uma em seu worktree. Revise os diffs, integre primeiro dados, depois UI. Esta é a melhor alternativa se o sistema de supervised workers estiver indisponível.

## Controle de segurança e custo
- Não encaminhe credenciais, tokens ou `.env` para prompts; não permita install scripts desconhecidos.
- Não habilite bypass/yolo sem entender as consequências.
- Não autorize deploy/cloud/API paga por padrão.
- Confira o consumo e quotas na interface de cada provedor; Orca é ambiente de execução, não inclui créditos ilimitados de modelos.
