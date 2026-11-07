# Antigravity — Agenda em Movimento V2

Você é dono da implementação visual complexa do app EXISTENTE, não de um app
novo. Leia AGENTS.md, todo docs/design/{PROMPT_COORDINATOR_REDESIGN,
DIRECAO_DE_ARTE,V2_CONTRACTS}.md e docs/design-review/2026-11-07-atual/REVISAO.md.
Abra as imagens de antes em docs/design-v2/before e a galeria de revisão. Use
skills Expo design-system/animation/native-ui/router e Vercel RN já rastreadas.
Impeccable pode apoiar direção; briefing explícito ganha. Não criar HTML no app.

Ownership EXCLUSIVO em V2_CONTRACTS. Você pode mudar tokens dentro do briefing,
mantendo exports; NÃO editar date-utils, dados/seletores, testes, package/lock,
app/_layout.tsx raiz. Solicite dependência/provider via docs/design-v2/ROOT_REQUEST.md
ou mensagem ao coordenador. Sem subagentes, build EAS, serviços pagos, resets do
usuário, comandos destrutivos ou refação total. No máximo as três rotas existentes.

Execute por fatias verticais e commits revisáveis:
1. Início: data em bloco editorial, headline 30–34sp, progresso em faixa compacta,
   título Em foco; use selectFocusTasks/getTaskStats/useTaskToday. Foco só pendente;
   estado 100% mostra conclusão e acesso ao histórico, nunca cards concluídos em foco.
   Primeira tarefa deve ser visível sem rolar em 360x800. CTA próximo ao polegar.
2. Atividades: linhas densas, filetes e ritmo editorial, título e prazo dominantes,
   descrição até UMA linha. Nada de lixeira repetida dominante; editar visível e
   concluir acessível. Status + disciplinas legíveis em 360. Contagem consistente
   com disciplina selecionada, usando helpers. Não aninhar botões.
3. Formulário: seletor compacto de disciplina (ainda aceita disciplina nova),
   datas pt-BR em um único controle, sem ISO exposto nem duplicação de prazo.
   Preserve DateTimePicker Android e confirmação nativa. Web usa parseDateInput/
   formatDateInput com erro real. Footer salvar FORA do ScrollView, com insets e
   KeyboardAvoidingView/adjustResize; não depender de scroll até o CTA. Padronizar
   fontes dos inputs, padding multiline, estados submitting/failure sem perder draft.
4. Vazio/erro: linguagem concisa, contraste, retry, nenhum falso vazio em erro.
5. Motion funcional: conclusão/progresso/filtro/salvar/entrada sem excesso,
   Reanimated e redução de movimento. Não usar setState por frame.

Paleta e famílias são obrigatórias. Preservar conceito universitário autoral com
data tipográfica, filetes finos e micro-rótulos; evitar coleções de cartões iguais,
sombras pesadas, glassmorphism e gradientes genéricos. Mínimo 4,5:1 texto comum;
coral como ícone/borda, texto de erro escuro. Alvos 44dp mínimo, preferir 48.

Use renderização REAL, não só descrição: em seu checkout use npm ci --ignore-scripts,
npx expo start --web --port 8082 (não ocupar 8081 do coordenador) e Playwright/Edge
para screenshots em docs/design-v2/worker-ui. Playwright está nas devDependencies;
Edge channel msedge disponível neste Windows. Pode iniciar servidor sem novo agente.
Abra screenshots, critique densidade/identidade e ajuste antes de entregar.
Pode compilar contra stubs do contrato; não finalizar mock paralelo de tarefas.
Para render intermediário você pode usar dados reais da baseline; coordenação
integrará seletores reais antes da aprovação final, nunca afirmar render validado
se o stub impedir. Neste caso peça ao coordenador o commit funcional já concluído.

Entregue commits por fatia e docs/design-v2/UI_REPORT.md: arquivos, npx tsc --noEmit,
empacotamento web/Android se executado, capturas reais e limites honestos. Não
alegar teclado Android, haptics ou 60fps sem execução. Se alguma verificação
falhar, corrigir ou reportar resultado failed, sem esconder erro em prosa.
