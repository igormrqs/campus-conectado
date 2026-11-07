# Relatório de UI e Motion — Task B (Antigravity)

Registro do worker antes da entrega final. Fontes, navegação, ícones e app.json
já foram integrados pelo coordenador; estado atual em `VALIDATION.md`.

**Projeto:** Campus Conectado (MVP Nativo)  
**Worker:** Antigravity (Worker B — Visual & Motion)  
**Data:** 2026-11-07  
**Status:** Concluído com sucesso (TypeScript, Metro Android e Metro Web validados com código 0).

---

## 1. Escopo e Arquivos Modificados / Criados

Todos os arquivos criados e atualizados respeitam estritamente os limites de ownership definidos em `AGENTS.md`, `docs/WORKER_UI.md` e as orientações da coordenação (`assets/**` autorizados para os ícones editoriais):

### Diretório `src/design/`
- [`src/design/date-utils.ts`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/design/date-utils.ts): Manipulação segura de datas civis ISO `YYYY-MM-DD` (sem conversões para UTC que desloquem o dia), verificação de atraso (`isOverdue`), formatação amigável relativa ("Hoje", "Amanhã", "Ontem", "12 de nov") e estampa editorial completa ("Sábado, 7 de novembro").
- [`src/design/motion.ts`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/design/motion.ts): Curvas de aceleração (`cubic-bezier` permitidas no Reanimated 4), configurações de molas (`springs.snappy`, `springs.gentle`) e constantes de animação alinhadas à skill `expo-animation`.
- [`src/design/platform-utils.ts`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/design/platform-utils.ts): Utilitários multiplataforma para confirmações com `window.confirm` no web e `Alert.alert` nativo com cancel/destructive, alertas genéricos e execução segura assíncrona de `Haptics` com `await` e `catch`.

### Diretório `src/components/`
- [`src/components/ThemedText.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/components/ThemedText.tsx): Componente tipográfico integrado com a escala tipográfica de `tokens.ts` (`hero`, `title`, `section`, `headline`, `body`, `label`, `caption`), com suporte a Dynamic Type.
- [`src/components/Button.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/components/Button.tsx): Botão tátil multi-variante (`primary`, `secondary`, `lime`, `outline`, `ghost`, `destructive`), com feedback tátil de clique (scale 0.98), estado de carregamento com `ActivityIndicator`, target mínimo de toque de 48dp e acessibilidade.
- [`src/components/ProgressCard.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/components/ProgressCard.tsx): Cartão editorial de alto contraste (superfície tinta `#171A21`), barra de progresso animada com Reanimated (`colors.lime`), cálculo de porcentagem e mensagens contextuais dinâmicas baseadas no ritmo do semestre.
- [`src/components/TaskCard.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/components/TaskCard.tsx): Cartão de atividade com microanimação tátil no checkbox (spring sequence 0.92 → 1.08 → 1), controles irmãos (sibling controls) que eliminam qualquer aninhamento inválido de botões DOM, texto de prazo em alto contraste (`colors.ink` com ícone coral), chip temático de disciplina, navegação para edição e confirmação nativa/web de exclusão.
- [`src/components/FilterPills.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/components/FilterPills.tsx): Seletor de filtros em pílulas ("Todas", "Pendentes", "Concluídas") com contagem em tempo real, transição reduzível respeitando `useReducedMotion()` e feedback háptico seguro (`triggerHaptic('selection')`).
- [`src/components/EmptyState.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/components/EmptyState.tsx): Estado vazio editorial com ícone geométrico em destaque e CTA para cadastro.
- [`src/components/Toast.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/components/Toast.tsx): Notificação flutuante de sucesso/aviso com safe areas, animação suave de entrada/saída (`FadeInDown`/`FadeOutDown`) e dispensa automática.
- [`src/components/Header.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/src/components/Header.tsx): Cabeçalho editorial consistente com a assinatura visual da marca "CAMPUS CONECTADO", data diária e ações de navegação com área de toque mínima de 48dp.

### Telas em `app/`
- [`app/index.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/app/index.tsx) (Rota `/`): Painel inicial com cabeçalho contendo a marca e estampa editorial, botão "Nova" na ação superior, saudação "Seu semestre tem ritmo.", cartão de progresso interativo, lista "Hoje no radar" com exatamente 2 cartões compactos prioritários, botão para ver todas as atividades, largura máxima de 640px centralizada para desktop/web e suporte a retry/resetDemo.
- [`app/activities.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/app/activities.tsx) (Rota `/activities`): Tela de lista completa de atividades com filtragem por status ("Todas", "Pendentes", "Concluídas") e por disciplina, ordenação inteligente (atrasadas no topo), largura máxima centralizada de 640px e banner de erro com ação `retryHydration()` caso a leitura de storage falhe.
- [`app/task-form.tsx`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/app/task-form.tsx) (Rota `/task-form?id=<id>`): Formulário unificado com todos os hooks declarados no topo incondicionalmente (garantindo carregamento direto de `/task-form?id=seed-01`), validação inline via `validateTaskInput`, atalhos de disciplinas e prazos ("Hoje", "Amanhã", "+3 dias", "+7 dias"), seletor de data flexível com quebra de linha em 360/412px, bloqueio ao salvar durante requisição assíncrona, guarda de id inexistente e largura de 640px centralizada.

### Assets Editoriais Gerados
- [`assets/campus-icon.png`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/assets/campus-icon.png): Ícone editorial 1024x1024 px com paleta papel `#F7F5EF`, tinta `#171A21`, azul `#314BCE` e lima `#DBF57A`.
- [`assets/android-icon-foreground.png`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/assets/android-icon-foreground.png): Ícone de primeiro plano adaptativo para Android (1024x1024 px).
- [`assets/campus-icon.svg`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/assets/campus-icon.svg): Código fonte vetorial do ícone da marca.

### Documentos
- [`docs/ROOT_LAYOUT_REQUEST.md`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/docs/ROOT_LAYOUT_REQUEST.md): Especificação do patch de fontes, status bar e opções de navegação.
- [`docs/APP_CONFIG_REQUEST.md`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/docs/APP_CONFIG_REQUEST.md): Trecho exato para configuração do APK standalone em `app.json`.
- [`docs/UI_REPORT.md`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/docs/UI_REPORT.md): Este relatório técnico de validação e entrega.

---

## 2. Refinamentos Visuais e Funcionais Realizados

1. **Separação de Controles Irmãos no `TaskCard`:**
   - O container externo do cartão agora é uma `View`. O checkbox, o bloco textual de edição e o botão de exclusão são componentes irmãos independentes.
   - Corrige completamente o erro do React DOM (`<button> cannot appear as a descendant of <button>`) no render web e elimina sobreposição de toques.
2. **Hierarquia da Home e Radar Compacto:**
   - O cabeçalho da Home exibe expressamente a marca "CAMPUS CONECTADO" com ponto indicador azul, data editorial diária e o botão "+ Nova" diretamente na barra superior.
   - O radar foi refinado para exibir exatamente **2 cartões compactos**, priorizando atrasadas e tarefas pendentes, mantendo a tela inicial limpa e escaneável.
3. **Contenção Centralizada em Telas Largas (Desktop / Web):**
   - Limite de `maxWidth: layout.maxWidth` (640px) com `alignSelf: 'center'` aplicado nas três rotas (`/`, `/activities`, `/task-form`).
   - Impede que cartões se estiquem excessivamente em resoluções desktop largas (ex.: 1257px), preservando o visual de caderno editorial.
4. **Layout Responsivo no Seletor de Data:**
   - A linha com a data selecionada e o botão "Outra data" utiliza `flexWrap: 'wrap'` e `gap: spacing.sm`, adaptando-se confortavelmente a telas de 360px a 412px de largura sem truncamento.
5. **Acessibilidade e Alto Contraste no Status de Atraso:**
   - O rótulo "Atrasada: [data]" agora renderiza texto na cor tinta (`colors.ink`) com o ícone de alerta em coral (`colors.coral`) e fundo suave, superando os critérios de contraste WCAG enquanto preserva a semântica da paleta.
6. **Ordem Incondicional dos Hooks no Formulário:**
   - Todos os hooks de estado, memo e parâmetros de rota foram movidos para o topo de `TaskFormScreen` antes de qualquer retorno condicional, garantindo estabilidade e permitindo a abertura direta de rotas como `/task-form?id=seed-01`.

---

## 3. Comandos Executados e Resultados de Verificação

### A. Verificação de Tipos TypeScript
```bash
npx tsc --noEmit
```
**Resultado:** Saída limpa (código 0). 0 erros de tipo.

### B. Empacotamento Metro para Android
```bash
npx expo export -p android --no-bytecode
```
**Resultado:** Saída com código 0. 1756 módulos empacotados com sucesso pelo Metro Bundler.

### C. Empacotamento Metro para Web
```bash
npx expo export -p web
```
**Resultado:** Saída com código 0. 1413 módulos empacotados com sucesso pelo Metro Bundler em 1,3 segundos.

### D. Correção de Branches de Render em Estado de Erro
- Em `app/activities.tsx`, quando `error` ocorre, os filtros, a lista e o `EmptyState` ("Nenhuma atividade encontrada" + CTA cadastrar) não são renderizados, exibindo exclusivamente o banner de erro com a ação de "Tentar novamente" (`retryHydration()`).
- Em `app/index.tsx` (Home), quando `error` ocorre, o `ProgressCard` com totais zerados, o radar e o botão de ver atividades são omitidos, exibindo apenas o banner de erro com retry e evitando a ilusão de caderno vazio.
- Em `src/components/TaskCard.tsx`, o prefixo duplicado `Atrasada: ` foi removido, exibindo a data amigável exata (ex.: `Ontem (atrasada)` ou `6 de nov (atrasada)`) sem alterar o layout do chip.

---

## 4. Limitações Conhecidas e Verificações Pendentes

1. **Aparelho Físico / ADB:**
   - O comando `adb` não está no PATH do terminal Windows local; a inspeção final em emulador ou dispositivo físico com Expo Go deve ser realizada pelo coordenador.
2. **Atualização do `app.json`:**
   - O trecho para inclusão dos novos ícones no `app.json` consta em [`docs/APP_CONFIG_REQUEST.md`](file:///C:/Users/igorm/orca/workspaces/Campus%20Conectado/campus-ui-antigravity/docs/APP_CONFIG_REQUEST.md).
