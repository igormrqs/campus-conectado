# PROMPT PARA CODEX COORDINATOR — CAMPUS CONECTADO V2

Atue como **diretor de produto, coordenador técnico e revisor final** do MVP acadêmico Campus Conectado. Já existe uma implementação funcional com capturas de tela. Não recrie do zero nem amplie o escopo sem necessidade. **Objetivo: transformar a experiência atual em um app editorial de identidade autoral, compacto, fácil de usar com uma mão, com microinterações significativas, mantendo os fluxos da demonstração funcionais.**

## Contexto e leitura obrigatória
1. Inspecione o código real, package.json, navegação, armazenamento e componentes antes de alterar.
2. Leia `docs/design-review/2026-11-07-atual/REVISAO.md`, abra `docs/design-review/2026-11-07-atual/index.html` e avalie as imagens na mesma pasta. Elas são capturas web em tamanho de celular, **não** screenshots de APK.
3. Leia `DIRECAO_DE_ARTE.md` deste kit, ou copie suas regras para `docs/design/DIRECAO_DE_ARTE.md`. Preserve o conceito editorial, cores base e fontes atuais.
4. Verifique se os recursos de orquestração do Orca estão acessíveis. Se não, trabalhe sem fingir que criou workers.

## Divisão rígida de responsabilidades — minimizar custo
**Codex Coordinator (você):** decisões técnicas complexas, priorização, orquestração, contratos entre agentes, integração, controle de regressões, testes, decisão final de QA. Se precisar, faça diretamente as partes críticas não delegadas.
**Codex worker, se o Orca permitir:** estados derivados (contadores, radar, filtro e datas), arquitetura de telas e navegação, armazenamento/CRUD, bugs complexos, integração de fluxos e testes funcionais. Se não houver Codex worker, assuma essas tarefas você mesmo.
**Antigravity:** proprietário das mudanças complexas de design visual, design system, tipografia, layout das três telas, responsividade, animações, acessibilidade visual, ajustes após screenshots. Trabalho visual deve ocorrer com feedback de renderização real, não só por descrição.
**OpenCode:** somente tarefas **extremamente simples, isoladas e de baixo risco**, por exemplo: atualizar textos estáticos, listas de dados demo, pequenas correções de documentação, ajustar nomes de constantes ou corrigir um lint trivial em arquivo sob sua posse. **Proibido** atribuir ao OpenCode decisões de UI/UX, implementação de animações, arquitetura, CRUD, navegação, persistência, depuração complexa, refatoração ampla ou integração.
**Limite de concorrência:** até dois workers simultaneamente. Priorize Codex worker + Antigravity; acione OpenCode posteriormente apenas para trabalho trivial. Se não houver trabalho trivial real, não recrute OpenCode por obrigação. Evite tarefas duplicadas, conversas infinitas e retrabalho.

## Regras de colaboração
- Defina file ownership antes da execução. Não permita edição concorrente dos mesmos arquivos entre agentes.
- Primeiro alinhe contratos de dados, estados, props e tokens de design. Só depois inicie alterações paralelas.
- Trate a implementação atual como baseline; preserve fluxos que já passam. Crie ponto de retorno via Git antes de alterar, sem apagar alterações locais do usuário.
- Execute o trabalho por **fatias verticais**: Início + radar; Lista + filtros + cartões; Formulário + teclado/datas; Estados vazio/erro; revisão Android.
- Cada worker deve entregar diff mínimo, screenshots quando disponíveis e evidências do que verificou. Rejeite 'feito' sem evidência.

## Design direction obrigatório
Conceito: **'Agenda em Movimento'**, uma linguagem editorial de caderno universitário contemporâneo, não um template de tarefas. Preservar `#F7F5EF`, `#171A21`, `#314BCE`, `#DBF57A`, `#E6674D`, Bricolage Grotesque e Instrument Sans. Usar datas com peso tipográfico, linhas editoriais, micro-rótulos e ritmo de espaços consistente como assinatura de marca. Sem glassmorphism, gradientes genéricos, sombras de cartão pesadas ou excesso de cards.

- **Início:** diminuir radicalmente o cabeçalho e painel de progresso; primeira atividade deve aparecer na primeira dobra em 360x800. Radar mostra **somente pendentes**, priorizados por vencidas, hoje, depois futuras. Progresso é calculado do estado real.
- **Atividades:** títulos e datas dominantes; itens compactos, descrição no máximo uma linha de apoio; filtro de status e disciplina legíveis em 360px; conclusão e edição evidentes; exclusão secundária com confirmação. Reduzir repetição visual entre cartões.
- **Formulário:** remover dupla representação ISO/atalhos do prazo; apresentar datas pt-BR com seletor funcional; compactar sugestões de disciplina; padronizar fontes e dimensões de inputs; CTA salvar acessível com teclado Android e insets.
- **Vazio/erro:** manter linguagem visual; status corretos; erro recuperável sem apagar dados, com texto legível e contraste.
- **Motion:** animações com propósito, preferencialmente Reanimated: mudança da barra de progresso, conclusão de tarefa, filtros, entrada de listas e feedback de salvamento. Respeitar opção de movimento reduzido. Não adicionar bibliotecas pesadas sem motivo.
- **Acessibilidade:** texto comum com contraste >=4,5:1, texto grande >=3:1; botões alvos >=44dp, preferir 48dp; rótulos e estados independentes de cor.

## Aceitação: verificar em vez de presumir
1. Compare screenshots **antes/depois** da tela inicial, lista, formulário, vazio, erro, mobile 360px, 390px e web largo. Faça ajustes visuais se falhar hierarquia, originalidade ou densidade.
2. Verifique fluxo CRUD real: criar > editar > concluir > filtrar > excluir; verificar atualização de contadores, barra de progresso, radar e persistência após fechar/reabrir.
3. Verifique teclado, date picker e transições Android num dispositivo/emulador quando disponível. Capturas web não provam o comportamento do APK. Se não houver ambiente Android, declare explicitamente esse limite.
4. Rode TypeScript, lint e testes disponíveis, sem inventar resultados.
5. Se já houver requisito de gerar APK no projeto, preserve-o e valide build quando possível. Não considere APK gerado sem conferir artefato real.
6. Revise criticamente: (a) identidade reconhecível sem logo, (b) primeira tarefa acima da dobra, (c) título e prazo compreendidos rapidamente, (d) edição descoberta sem instruções, (e) contraste, (f) animações úteis, (g) ausência de regressões.

## Ordem de execução e autonomia
- **Fase A:** diagnóstico do código e screenshots; contrato das mudanças; tarefas pequenas com owners claros.
- **Fase B:** Antigravity lidera a implementação visual; Codex worker ou você corrige estados/funcionalidade de maneira paralela, sem colisões de arquivos.
- **Fase C:** integração pelo Coordinator, testes e captura de screenshots reais; rodada única de ajustes direcionados para defeitos observados.
- **Fase D:** README, demonstração de 5 minutos, instruções Expo/APK e relatório final.

Não pare apenas para relatar progresso. Tome decisões coerentes com este briefing e avance até a melhor versão executável dentro dos recursos disponíveis. Peça intervenção humana somente quando bloqueado por autenticação, permissão ou risco relevante. Não compre serviços, não apague dados/repositórios e não afirme que validou Android/APK sem validação real.

## Entrega obrigatória
- Código existente aperfeiçoado, não refeito do zero sem justificativa.
- Arquivos alterados com resumo breve; screenshots antes/depois; resultados de TypeScript/testes; fluxo de demo; estado real do APK e pendências técnicas, se houver.
- Relatório sucinto indicando quem fez o quê e em quais evidências cada aprovação visual se baseou.
