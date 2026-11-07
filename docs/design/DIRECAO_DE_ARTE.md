# Campus Conectado — Direção de Arte V2

## Decisão
Refinar o design editorial atual, tornando-o **mais expressivo no sistema visual e mais compacto no uso**. Preservar o fundo quente, o azul elétrico, o verde-lima e as fontes existentes. Priorizar o MVP acadêmico que será demonstrado em Android.

## Diagnóstico das capturas fornecidas (07/11/2026)
- **Início**: cabeçalho/título e painel de progresso ocupam espaço demais; primeira atividade fica abaixo do ideal na primeira dobra. Radar deve mostrar apenas atividades pendentes, ordenadas por urgência.
- **Lista**: cartões repetidos, padding elevado, descrição longa, ícone excluir mais evidente do que editar, filtros pouco claros em viewport de 360 px.
- **Formulário**: seis chips de disciplina ocupam muito espaço; data exibida simultaneamente por atalhos e campo ISO; CTA de salvar e teclado podem conflitar; padronizar fontes dos campos; campo de descrição precisa de padding adequado.
- **Estados**: vazio visualmente consistente, mas pode ficar mais enxuto; erro de armazenamento com contraste/recuperação a melhorar e sem jamais apagar dados automaticamente.
- **Wide**: tratar como apresentação web; a referência de aceitação é a viewport Android de 360 e 390 dp.

## Conceito
**'Agenda em Movimento'**: linguagem de caderno/agenda universitária reinterpretada com precisão editorial, não com ilustrações literais de papel. Assinatura recorrente: data em bloco tipográfico, filete fino de divisão, marcador de andamento e micro-rótulos de disciplina. A repetição da estrutura, e não dos cartões, cria familiaridade.

## Paleta (tokens iniciais; validar contraste)
- Papel `#F7F5EF` — fundo principal.
- Tinta `#171A21` — texto e superfícies de alto contraste.
- Azul `#314BCE` — ação principal, seleção e elementos da marca.
- Lima `#DBF57A` — progresso, conclusão, detalhes ocasionais; nunca texto minúsculo em fundo branco sem checagem.
- Coral `#E6674D` — sinalização de alerta como ícone/borda; para texto usar tinta ou tom escurecido com contraste >= 4,5:1.
- Não adicionar gradientes purple/blue, glassmorphism, sombras pesadas, emojis de interface, padrões ilustrativos genéricos ou cartões iguais em todas as superfícies.

## Tipografia
- Headline: Bricolage Grotesque, peso expressivo, quebra semântica e área limpa.
- UI: Instrument Sans, pesos previsíveis, mínimo recomendado para corpo 14–16sp e contraste normal >=4,5:1.
- Hierarquia sugerida: H1 30–34sp (máximo duas linhas), H2 20–23sp, títulos de tarefas 16–17sp, rótulos 11–12sp com espaçamento discreto, suporte 13–14sp. Ajustar conforme escalonamento de fonte Android.

## Layout e componentes
- Margens horizontais 20px em 390 dp, 16px em 360 dp; escala de espaços 4/8/12/16/20/24/32; alvos de toque >=44dp (preferir 48dp).
- Início: cabeçalho compacto, headline de até duas linhas, progresso em faixa horizontal compacta (não um cartão hero gigante), título 'Em foco', atividades pendentes ordenadas por atraso > hoje > próximas. Primeira tarefa visível sem rolar na viewport de teste.
- Atividades: filtros de status com números atualizados; disciplinas em faixa horizontal claramente rolável ou seletor. Linhas densas com prioridade **título e prazo**; disciplina em micro-rótulo, descrição opcional limitada a uma linha; conclusão acessível e ação editar inequívoca. Excluir por menu de contexto ou ação secundária, com confirmação.
- Formulário: título, disciplina, prazo e descrição opcional. Disciplina via seletor compacto com opções; data localizada em pt-BR e um único campo canônico (atalhos rápidos opcionais). Rodapé com salvar disponível acima da área segura e adaptado ao teclado. Erros inline claros.
- Vazio: mensagem concisa, elemento gráfico da identidade e uma CTA. Erro: contraste correto, causa compreensível e tentativa de recuperação sem apagar dados.

## Motion & microinterações
- Entrada de tela 220–320ms, leve deslocamento/fade sem cascata longa.
- Concluir atividade: feedback tátil curto quando permitido, checkbox 160–220ms, alteração de progresso 250–350ms, reorganização da lista sem saltos; respeitar reduce motion.
- Filtros 150–220ms; botões 100–160ms; salvar com estado carregando e feedback imediato; evitar animação em tudo.
- Qualquer movimento deve comunicar **mudança de estado, prioridade ou navegação**, nunca apenas enfeitar.

## Correção de estado/funcionalidade
- Dados iniciais simulados são permitidos; CRUD deve funcionar durante a apresentação, com persistência local se possível.
- Contadores e porcentagens calculados do mesmo conjunto de tarefas, nunca valores hardcoded. `Em foco` não exibe tarefas concluídas. Prioridade de tarefas vencidas precisa se atualizar quando uma delas é concluída. Datas visíveis em pt-BR.
- Tratamento de tamanho longo, viewport 360px, teclado aberto, Android seguro e não destrutivo ao falhar armazenamento.

## Critérios de aprovação
- Testar visualmente em 360x800 e 390x844, além de screenshot do app Android quando disponível.
- Em 360x800, pelo menos o início da primeira tarefa fica visível sem rolagem; CTA principal sempre acessível no formulário.
- Título e prazo identificáveis em <=2s em uma lista de 8+ tarefas; edição com affordance óbvia.
- Texto normal >=4,5:1; rótulos grandes >=3:1; não depender apenas de cor para status.
- Demonstrar: criar > editar > concluir > filtrar > excluir > fechar/reabrir > conferir persistência.
- Documentar screenshot antes/depois de cada tela, falhas reais e o que não pôde ser testado no Android.
- Revisão independente com foco em originalidade, clareza, densidade, acesso com uma mão, motion e funcionamento. Nenhum 'design aprovado' sem screenshot real do resultado.
