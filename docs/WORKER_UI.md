# Task B — Antigravity

Construa a UI e motion do MVP nativo Campus Conectado neste worktree isolado.
Leia integralmente AGENTS.md e docs/, especialmente DESIGN_DIRECTION.md,
CONTRACTS.md, DEMO_SCENARIO.md. Execute somente Worker B do EXECUTION_PLAN.
Use skills Expo design-system/animation/native-ui/router e Vercel RN; frontend-design
somente como direção visual, nunca HTML. Não iniciar agentes, usar serviços/modelos
pagos nem bypass. Ações arriscadas exigem aprovação manual do usuário.

Ownership: app/** exceto _layout.tsx raiz; src/components/**; src/design/** exceto
tokens.ts. Contratos e tokens congelados: não editar. Três telas nativas completas
em português nas rotas /, /activities, /task-form?id=<id>. Formulário sem id cria.
Importe useTasks, validateTaskInput e tipos de @/src/features/tasks.
Nenhum estado paralelo de tarefas nem mock final; pode compilar contra skeleton.
Inclua hidratação/erro com retry/empty/content; CRUD real, confirmação ao excluir,
validação inline, await/catch e feedback de sucesso, bloqueio ao salvar, safe areas,
texto grande, prazo vencido, datas locais, teclado sem cobrir CTA e acessibilidade.

Direção Caderno em Movimento, tokens existentes, Bricolage e Instrument Sans
locais já instaladas. Motion significativa com redução de movimento: entrada,
concluir/progresso, filtro, apresentação nativa do formulário e sucesso. Sem
animação infinita. Até 3 telas e 5 interações memoráveis; sem features extras.
Root layout pertence ao coordenador: registre código exato de integração de fontes,
Stack e status bar em docs/ROOT_LAYOUT_REQUEST.md. Não alterar package/lock.
Peça dependências ao coordenador. Não substituir seed do Worker A.

Use npm install --ignore-scripts neste worktree se preciso. Teste tsc, bundling
e fluxo real se houver ambiente. Não declarar Android/aparelho/performance sem
execução. Prepare docs/UI_REPORT.md com arquivos, comandos, evidências visuais
reais quando possíveis, limitações e verificações pendentes. Saída não zero
não resolvida é falha da Task. Faça commit dos próprios arquivos, informe hash
e worker_done. Não mergear outras branches nem pedir refação integral.
